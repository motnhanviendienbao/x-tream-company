import { Pagination,ConfigProvider } from 'antd';

type paginationProps = {
    page: number,
    pageSize: number,
    total: number,
    pageChange: (args?: any) => void,
    recordChange: (args?: any) => void
}

const PaginationUI = ({page ,pageSize ,total ,pageChange,recordChange}:paginationProps) => {
    const theme = {
    token: {
      colorPrimary: "#000000",
      colorPrimaryHover: "#000000",
    }};
 

    return(
        <ConfigProvider theme={theme}>
            <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                onChange={(p, ps) => {
                    pageChange(p);
                    recordChange(ps);
                }}
            />
        </ConfigProvider>
    );
}

export default PaginationUI;