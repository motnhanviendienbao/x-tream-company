import {  Tabs,ConfigProvider } from 'antd';
import type { TabsProps } from "antd";




const TabList = ({items,type}:TabsProps) => {
    const theme = {
        "components":{
            "Tabs":{
                "margin":0,
                "itemSelectedColor": "rgb(0,0,0)",
                "itemHoverColor":"rgb(255, 255, 255)",
                "itemActiveColor":"rgb(255, 255, 255)",
                "itemColor":"rgb(255, 255, 255)"
            }
        }
    }
    return(
        <ConfigProvider theme={theme}>
        <Tabs
        items={items}
        type={type}
        />
        </ConfigProvider>
    );
}

export default TabList;