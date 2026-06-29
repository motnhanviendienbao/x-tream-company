import { Input,DatePicker,Checkbox,Select,AutoComplete,ConfigProvider } from "antd";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Search } from "lucide-react";
type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};
type inputType = "text" | "select" | "datePicker" | "checkBox" | "search" | "hidden" | "autocomplete";
type InputProps<T extends FieldValues> = {
  label?: string;
  name: Path<T>;
  required?: boolean;
  select?: SelectOption[];
  className?: string;
  placeHolder?: string;
  control: Control<T>;
  options?: SelectOption[];
  inputType: inputType;
};

const InputForm = <T extends FieldValues>({
  label,
  placeHolder,
  control,
  name,
  required,
  options,
  inputType
}: InputProps<T>) => {
  const size = "large";
  const placeHolderStatus = placeHolder ?? "";
  const theme = {
    token: {
      colorPrimary: "#000000",
      colorPrimaryHover: "#000000",
    },
};

  switch (inputType) {
    case "text":
      return(
        <ConfigProvider theme={theme}>
          <div className="flex flex-col gap-1 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <div>{label}</div>
            {required && <span className="text-red-500">*</span>}
          </div>
        )}

        <Controller
          name={name}
          control={control}
          render={({ field,fieldState }) => (
            <>
              <Input
              {...field}
              size={size}
              placeholder={placeHolderStatus}
              />

              {fieldState.error && <p>{fieldState.error.message}</p>}
              {fieldState.isTouched && <p>{"already"}</p>}
            </>
            
          )}
        />
      </div>
        </ConfigProvider>
      );
      break;
    case "datePicker":
        return(
        <ConfigProvider theme={theme}>
            <div className="flex flex-col gap-1 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <div>{label}</div>
            {required && <span className="text-red-500">*</span>}
          </div>
        )}

        <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            className="w-full"
            size={size}
          />
        )}
        />
      </div>
        </ConfigProvider>
      );
      break;
    case "autocomplete":
      return(
        <ConfigProvider theme={theme}>

        </ConfigProvider>
      );
      break;
    case "checkBox":
      return(
        <ConfigProvider theme={theme}>
            <div className="flex flex-col gap-1 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <div>{label}</div>
            {required && <span className="text-red-500">*</span>}
          </div>
        )}

        <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Checkbox
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
          />
        )}
        />
      </div>
        </ConfigProvider>
      );
      break;
    case "hidden":
      return(
        <ConfigProvider theme={theme}>
                  <div className="flex flex-col gap-1 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <div>{label}</div>
            {required && <span className="text-red-500">*</span>}
          </div>
        )}

        <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input.Password
            value={field.value}
            onChange={(value) => field.onChange(value)}
            placeholder={placeHolder}
            size={size}
          />
        )}
      />
      </div>
        </ConfigProvider>
      );
      break;
    case "search":
      return(
        <ConfigProvider theme={theme}>
                  <div className="flex flex-col gap-1 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <div>{label}</div>
            {required && <span className="text-red-500">*</span>}
          </div>
        )}

        <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <AutoComplete 
            {...field}
            placeholder={placeHolder}
            size={size}
            options={options}
            suffix = <Search/>
          />
        )}
      />
      </div>
        </ConfigProvider>
      );
      break;
    case "select":
      return(
        <ConfigProvider theme={theme}>
                  <div className="flex flex-col gap-1 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <div>{label}</div>
            {required && <span className="text-red-500">*</span>}
          </div>
        )}

        <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
            options={options}
            placeholder={placeHolder}
            size={size}
          />
        )}
      />
      </div>
        </ConfigProvider>
      );
      break;

  }
};

export default InputForm;