import { useState } from "react";

interface CreateGroupFormProps {
    userId: string
    closeFn: () => void
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = (props) => {
    const [groupName, setGroupName] = useState<string>();
    const [groupIcon, setGroupIcon] = useState<string>();

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGroupName(e.target.value);
    }

    const handleChangeIconURL = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            setGroupIcon(undefined);
        } else {
            setGroupIcon(e.target.value);
        }
    }

    const handleCreateGroup = async () => {
        const request = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            groupName, userId: props.userId, groupIcon
          })
        };
        const newGroup = await fetch('/api/groups', request);
        if (newGroup.status != 200) {
          console.error("Failed to create group");
          return;
        }
    
      };

    return (
        <div className="flex items-center place-content-center w-full">
            <div className="flex flex-col w-fit items-center place-content-center m-auto p-6 gap-8 border-2">
                <button className="ml-auto text-white -m-4" onClick={props.closeFn}>X</button>
                <h2 className="text-4xl text-white">Create New Group</h2>
                <form className="flex flex-col w-3/4 h-full text-center place-content-center gap-6 text-2xl text-white">
                    <label htmlFor="groupName">
                        Group Name
                    </label>
                    <input className="bg-black border-2" id="groupName" onChange={handleChangeName}></input>

                    <label htmlFor="groupIcon">
                        Group Icon
                    </label>
                    <input className="bg-black border-2" id="groupIcon" onChange={handleChangeIconURL}></input>

                    <button className="text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white" onClick={handleCreateGroup}>
                        Create Group
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateGroupForm;