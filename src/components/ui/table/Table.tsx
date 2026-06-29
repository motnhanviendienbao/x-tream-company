
import { Tooltip } from 'antd';
import { isTooltip } from '../../../utils/helper';
import PaginationUI from './Pagination';
type TableConfig<T> = {
  sourceConfig: T[];
  titleConfig: string[];
  fieldMapConfig: (keyof T)[];
  
};

const TableUI = <T,>({
  sourceConfig,
  titleConfig,
  fieldMapConfig,
}: TableConfig<T>) => {
  return (
<div className='w-full'>
    <table className='w-full'>
      {/* header */}
      <thead>
        <tr>
          {titleConfig.map((title, index) => (
            <td key={index} className="p-2 font-semibold text-center bg-[#E2E8F0]">{title.trim().toUpperCase()}</td>
          ))}
        </tr>
      </thead>

      {/* content */}
      <tbody>
        {sourceConfig.map((item, rowIndex) => (
          <tr key={rowIndex}  className={`${rowIndex % 2 === 1 ? "bg-[#E2E8F0]" : ""}`}>
            {fieldMapConfig.map((field, colIndex) => (
              <td key={colIndex} className='text-center p-2'>
                {isTooltip(String(item[field]).trim()) 
                ? 
                ( 
                <Tooltip
                title={String(item[field]).trim()}
                placement={"bottom"}
                >
                {String(item[field]).trim().substring(0,10).concat("...")}
                </Tooltip>
                ) 
                : 
                (String(item[field]).trim()) 
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>

      {/* pagination */}

    </table>
        <div  className='flex justify-end mt-3'>
            {
                sourceConfig.length !== 0 && (
                    <div>
                        <PaginationUI
                            page={1}
                            pageSize={1}
                            total={2}
                            pageChange={()=>("")}
                            recordChange={()=>("")}
                        />
                    </div>
                )
            }
        </div>
 </div>
  );
};

export default TableUI;
