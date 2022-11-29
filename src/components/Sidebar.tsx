import type { GroupAndMessages } from "../pages";
import UserProfile from "./UserProfile";
import Image from "next/image";

interface SidebarProps {
    className?: string,
    userName: string,
    userImageUrl: string | null,
    groupsAndMessages: GroupAndMessages[],
    clickGroupFn: (groupId: number) => void,
    createGroupFn: () => void,
}

const Sidebar: React.FC<SidebarProps> = (props) => {
    return (
        <>
        <div className={ `${props.className ?? ""} flex flex-col w-1/4 h-full border-r-2`}>
          <div className="flex flex-col w-full h-full pt-5 gap-2 overflow-y-auto scrollbar">
            {props.groupsAndMessages.map((group) => 
              <div 
              key={group.id} 
              className="flex flex-row items-center text-white transition-colors ease-in-out duration-500 hover:bg-white hover:text-black p-2 mx-5 gap-2"
              onClick={() => props.clickGroupFn(group.id)}>
                {group.iconUrl ? (
                    <Image 
                    className="h-14 w-auto aspect-square object-contain grayscale border-[0.01rem] border-solid"
                    src={group.iconUrl} 
                    alt="group icon"
                    width={460} 
                    height={460} /> 
                  ) : (
                    <div className="bg-black border-[0.01rem] border-solid h-14 w-auto aspect-square" />
                )}
                <div className="overflow-hidden hidden md:block">
                  <h4 className={ `truncate text-lg` /*${group.read ? "font-thin" : "font-bold"}`*/}>
                    {group.name}
                  </h4>
                  <p className={`truncate` /*${group.read ? "font-thin" : "font-bold"}`*/}>
                    {group.messages[group.messages.length-1]?.message}
                  </p>
                </div>
              </div>
            )}
            <div className="hidden lg:block text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white p-2 mx-5"
                onClick={props.createGroupFn}>
                    CREATE NEW GROUP
            </div>
            <div className="lg:hidden text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white p-2 mx-7"
                onClick={props.createGroupFn}>
                    +
            </div>
          </div>
          {/** User Profile */}
          <UserProfile userName={props.userName} imageSrc={props.userImageUrl} />
        </div>
        </>
    )
}

export default Sidebar;