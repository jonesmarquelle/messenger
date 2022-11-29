interface CreateGroupCTAProps {
    showFormFn: () => void;
}

const CreateGroupCTA: React.FC<CreateGroupCTAProps> = (props) => {
    return (
        <>
        <div className="text-white flex flex-col justify-center w-full h-full items-center gap-6">
                <h3 className="text-4xl">No Group Selected</h3>
                <p>Select a group from the sidebar</p>
                <button className="rounded-lg bg-white transition-colors duration-200 hover:bg-neutral-400 text-black p-4"
                 onClick={props.showFormFn}>
                  Create New Group
                </button>
        </div>
        </>
    )
}

export default CreateGroupCTA;