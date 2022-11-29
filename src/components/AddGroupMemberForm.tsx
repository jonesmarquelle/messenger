import { useState } from "react";

enum FindUserStatus {
    found = "found",
    notFound = "not found",
    searching = "searching",
}

interface AddGroupMemberFormProps{
    groupId: number
    closeFn: () => void
}

const AddGroupMemberForm: React.FC<AddGroupMemberFormProps> = (props) => {
    const [userFoundStatus, setUserFoundStatus] = useState<FindUserStatus>();

    const addGroupMember = async (username: string) => {
        return;
    };
    
    return (
        <div className="flex items-center place-content-center w-full">
            <div className="flex flex-col items-center place-content-center m-auto p-6 gap-8 border-2">
                <button className="ml-auto text-white -m-4" onClick={props.closeFn}>X</button>
                <h2 className="text-4xl text-white">Add New Group Member</h2>
                <form className="flex flex-col w-3/4 h-full text-center place-content-center gap-6 text-2xl text-white">
                    <label htmlFor="userName">
                        Username
                    </label>
                    <div className="flex flex-row">
                        <input className="bg-black border-2 border-r-0" id="userName"/>
                        <button className="text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white px-2">+</button>
                    </div>
                    {userFoundStatus === FindUserStatus.notFound && <p className="hidden text-sm text-white -mt-5">Username not found!</p>}
                </form>
            </div>
        </div>
    )
}

export default AddGroupMemberForm;