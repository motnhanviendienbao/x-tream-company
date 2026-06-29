// "DB" giả lập bằng localStorage cho phần đăng nhập (không cần backend).
// authService đóng vai trò như một lớp API: đọc/ghi user và trạng thái đăng nhập.

export type LoginStatus = "SUCCESS" | "INVALID" | "LOCKED";

export interface LoginResult {
  status: LoginStatus;
  /** Thời gian còn lại bị khóa (ms), chỉ có khi status === "LOCKED". */
  remainingMs?: number;
}

interface User {
  username: string;
  password: string;
}

interface LoginState {
  failedAttempts: number;
  lockUntil: number | null;
}

const USERS_KEY = "xtream_users";
const STATE_KEY = "xtream_login_state";
const CURRENT_USER_KEY = "xtream_current_user";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

// Tài khoản mẫu được seed sẵn vào localStorage ở lần chạy đầu tiên.
const SEED_USERS: User[] = [{ username: "admin", password: "password123" }];

function readUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return SEED_USERS;
  }
}

function readState(): LoginState {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return { failedAttempts: 0, lockUntil: null };
  try {
    return JSON.parse(raw) as LoginState;
  } catch {
    return { failedAttempts: 0, lockUntil: null };
  }
}

function writeState(state: LoginState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/** Số mili-giây còn lại đang bị khóa; 0 nếu không bị khóa. */
export function getLockRemaining(): number {
  const state = readState();
  if (state.lockUntil && Date.now() < state.lockUntil) {
    return state.lockUntil - Date.now();
  }
  return 0;
}

export function getCurrentUser(): { username: string } | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { username: string };
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function login(username: string, password: string): LoginResult {
  const state = readState();
  const now = Date.now();

  // Đang trong thời gian bị khóa.
  if (state.lockUntil && now < state.lockUntil) {
    return { status: "LOCKED", remainingMs: state.lockUntil - now };
  }

  // Hết hạn khóa -> reset bộ đếm.
  if (state.lockUntil && now >= state.lockUntil) {
    state.failedAttempts = 0;
    state.lockUntil = null;
  }

  const matched = readUsers().find(
    (u) => u.username === username && u.password === password
  );

  if (matched) {
    writeState({ failedAttempts: 0, lockUntil: null });
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username }));
    return { status: "SUCCESS" };
  }

  const failedAttempts = state.failedAttempts + 1;

  // Sai đủ 5 lần -> khóa 5 phút.
  if (failedAttempts >= MAX_ATTEMPTS) {
    const lockUntil = now + LOCK_DURATION_MS;
    writeState({ failedAttempts, lockUntil });
    return { status: "LOCKED", remainingMs: LOCK_DURATION_MS };
  }

  writeState({ failedAttempts, lockUntil: null });
  return { status: "INVALID" };
}
