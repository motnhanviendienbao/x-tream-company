import { Button,ConfigProvider } from 'antd';
type ButtonType =
  | "CANCEL_BUBBLE"
  | "CANCEL_BLACK"
  | "VALID_NO_OUTLINE"
  | "VALID_OUTLINE"
  | "LINK";

type ButtonProps = {
  buttonType?: ButtonType;
  disabled?: boolean;
  act?: (args?:any) => void;
  title: string
};

const ButtonUI = ({ buttonType, disabled, act, title }: ButtonProps) => {
const THEME_CANCEL_BLACK = {
  components: {
    Button: {
      colorPrimary: "#000000",
      colorPrimaryHover: "#000000",
      colorPrimaryActive: "#000000",
      colorPrimaryBorder: "#000000",
      colorBorder: "#000000",
    },
  },
};

const THEME_CANCEL_BUBBLE = {
  components: {
    Button: {
      colorPrimary: "#2E2740",
      colorPrimaryHover: "#2E2740",
      colorPrimaryActive: "#2E2740",
    },
  },
};

const THEME_VALID_NO_OUTLINE = {
    components: {
    Button: {
      colorPrimary: "#000000",
      colorPrimaryHover: "#000000",
      colorPrimaryActive: "#000000",
      colorPrimaryBorder: "#000000",
    },
  },
}

const THEME_VALID_OUTLINE = {
    components: {
    Button: {
      colorPrimary: "#000000",
      colorPrimaryHover: "#000000",
      colorPrimaryActive: "#000000",
    },
  },
}

  switch(buttonType) {
    case "CANCEL_BLACK":
      return(
    <ConfigProvider
      theme={THEME_CANCEL_BLACK}
    >
      <Button 
      type='primary' 
      disabled={disabled} 
      onClick={act} 
      variant='outlined'
      color='default'
      >{title}
      </Button>
    </ConfigProvider>
      );
    case "CANCEL_BUBBLE":
      return(
    <ConfigProvider
      theme={THEME_CANCEL_BUBBLE}
    >
      <Button 
      type='primary' 
      disabled={disabled} 
      onClick={act} 
      >{title}
      </Button>
    </ConfigProvider>
      );
    case "VALID_NO_OUTLINE":
      return(
    <ConfigProvider
      theme={THEME_VALID_NO_OUTLINE}
    >
      <Button 
      type='primary' 
      disabled={disabled} 
      onClick={act} 
      color='default'
      >{title}
      </Button>
    </ConfigProvider>
      );
    case "VALID_OUTLINE":
      return(
    <ConfigProvider
      theme={THEME_VALID_OUTLINE}
    >
      <Button
        onClick={act}
        type="default"
        variant="outlined"
        style={{
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #fff",
        }}
      >
        {title}
      </Button>
    </ConfigProvider>
      );
    case "LINK":
      return(
        <Button 
        type="link"
        onClick={act}
        >
          {title}
        </Button>
      );
  }
};

export default ButtonUI;