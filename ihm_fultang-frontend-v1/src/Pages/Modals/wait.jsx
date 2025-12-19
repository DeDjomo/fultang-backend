import {Spin} from "antd";
import { LoadingOutlined } from '@ant-design/icons'

export default function Wait ()
{
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col space-y-3 justify-center items-center border-2 rounded w-[300px] h-[200px] bg-gray-100 relative transition-all duration-300 ">
                <Spin
                    indicator={
                        <LoadingOutlined
                            style={{
                                fontSize: 70,
                                color: '#50C2B9'
                            }}
                            spin
                        />
                    }
                />
            </div>
        </div>
    )
}