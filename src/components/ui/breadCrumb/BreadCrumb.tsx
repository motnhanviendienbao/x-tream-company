import { Breadcrumb, ConfigProvider } from "antd";
import type { BreadcrumbProps, TabsProps } from "antd";
import TabList from "../Tab";
import BreadCrumbDetail from "./BreadCrumbDetail";

type BreadCrumbUIProps = {
  type?: "advanced";
  title?: string;
  breadcrumbItems?: BreadcrumbProps["items"];
  tabsItems?: TabsProps["items"];
};

const breadcrumbTheme = {
  components: {
    Breadcrumb: {
      itemColor: "#fff",
      lastItemColor: "#fff",
      separatorColor: "#fff",
    },
  },
};

const BreadCrumbUI = ({
  type,
  title,
  breadcrumbItems,
  tabsItems,
}: BreadCrumbUIProps) => {
  return (
    <div className="w-full h-full bg-primary flex flex-col gap-5">
      {/* breadcrumb */}
      <ConfigProvider theme={breadcrumbTheme}>
        <Breadcrumb items={breadcrumbItems} />
      </ConfigProvider>

      {/* title / detail */}
      <div className="w-full">
        {type ? (
          <BreadCrumbDetail
            id={1}
            title="Mr"
            name="Ngoc Tu"
            money={12.5}
            status={false}
          />
        ) : (
          <div>{title}</div>
        )}
      </div>

      {/* tabs */}
      {type && <TabList type="card" items={tabsItems} />}
    </div>
  );
};

export default BreadCrumbUI;