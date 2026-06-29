
import { Tag } from 'antd';

type BreadCrumbDetailProps = {
    id: number,
    title: string,
    name: string,
    money: number,
    status: boolean
}
const BreadCrumbDetail = ({id,title,name,money,status}:BreadCrumbDetailProps) => {
    return(
        <div className="flex flex-col text-white w-full">
            <div className="">
            investor {id}
            </div>
            <div className="flex items-baseline gap-2">
                <div className='text-2xl font-semibold'>{title}. {name}</div>
                <div>{money} AUD</div>
                <div>
                    {!status && (<Tag color={"red"} variant={"solid"}>inactive</Tag>)}
                </div>
            </div>
        </div>
    );
}

export default BreadCrumbDetail;