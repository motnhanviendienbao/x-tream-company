import { Card } from "antd";

type cardProps = {
    children?: React.ReactNode;
}

const CardContainer = ({children}:cardProps) => {
    return(
        <Card color="#fff"> {children} </Card>
    );
}

export default CardContainer;
