import { User } from "@prisma/client";
import { useState } from "react";
import { useMembers } from "../hooks/groupsHook";
import { DBGroupAction } from "../pages";

enum FindUserStatus {
    found = "found",
    notFound = "not found",
    searching = "searching",
}

interface GroupMemberFormProps{
    userId: string
    groupId: number
    closeFn: () => void
    addMemberCallback: () => void
    removeMemberCallback: () => void
}

const GroupMemberForm: React.FC<GroupMemberFormProps> = (props) => {
    const [userFoundStatus, setUserFoundStatus] = useState<FindUserStatus>();
    const [userName, setUserName] = useState<string>();
    const { members, refreshMembers, isError } = useMembers(props.groupId);

    const [showConfirmMenu, setShowConfirmMenu] = useState<boolean>(false);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
    }

    const handleAddGroupMember = async () => {
        setUserFoundStatus(FindUserStatus.searching);
        if (!userName) return;
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userName, action: DBGroupAction.addMember
            })
        };
        const newMember = await fetch(`/api/groups?groupId=${props.groupId}`, request);
        if (!newMember.ok || !newMember) {
            setUserFoundStatus(FindUserStatus.notFound);
            console.error("Failed to add member");
            return;
        } else {
            setUserFoundStatus(FindUserStatus.found);
            await refreshMembers();
            props.addMemberCallback();
            return;
        }
    };
    
    const handleRemoveGroupMember = async () => {
        const request = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: DBGroupAction.removeMember, userId: props.userId
            })
        };

        const res = await fetch(`/api/groups?groupId=${props.groupId}`, request);
        if (!res.ok) {
            console.error("Failed to remove member");
            return;
        } else {
            await refreshMembers();
            props.removeMemberCallback();
            return;
        }
    }

    return (
        <div className="flex flex-col items-center w-full m-auto gap-3">
            <div className="flex flex-col items-center place-content-center p-6 gap-4 border-2">
                <button className="ml-auto text-white -m-4" onClick={props.closeFn}>X</button>
                <div className="flex flex-col gap-1 items-center">
                <h2 className="text-2xl text-white">Group Members</h2>
                    {members?.map((m: User) => <p key={m.name} className="text-md text-white">{m.name}</p>)}
                </div>
                <h2 className="text-2xl text-white">Add New Group Member</h2>
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col w-3/4 h-full text-center items-center gap-2 text-xl text-white">
                    <label htmlFor="userName">
                        Username
                    </label>
                    <div className="flex flex-row">
                        <input onChange={handleChangeName} className="bg-black border-2 border-r-0" id="userName"/>
                        <button onClick={handleAddGroupMember} className="text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white px-2">+</button>
                    </div>
                    {userFoundStatus === FindUserStatus.notFound ? <p className="text-sm text-white">Username not found!</p> : undefined}
                </form>
                <button onClick={() => setShowConfirmMenu(true)} className="text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-red-500 border-2 border-white px-2">
                    Leave Group
                </button>
            </div>
            { showConfirmMenu ? (
                <div className="flex flex-col items-center border-2 h-fit p-3">
                    <h4 className="text-2xl text-white">
                        Are you sure?
                    </h4>
                    <div className="flex flex-row items-center justify-center gap-2">
                        <button onClick={handleRemoveGroupMember} className="w-20 text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white px-2">
                            Yes
                        </button>
                        <button onClick={() => setShowConfirmMenu(false) } className="w-20 text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white px-2">
                            No
                        </button>
                    </div>
                </div>
            ) : (
                undefined
            )}
        </div>
    )
}

export default GroupMemberForm;