import { signOut } from "next-auth/react";
import Image from "next/image";

interface UserProfileProps {
    userName: string, 
    imageSrc: string | null, 
}

const UserProfile: React.FC<UserProfileProps> = (props) => {
    const handleSignOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        signOut();
    };

    return (
        <>
        <div className="flex flex-col md:flex-row h-[8vh] lg:h-[14vh] w-full items-center bg-black border-white border-solid border-t-2 gap-4 mt-auto p-4">
            {props.imageSrc ? (
            <Image
                className="hidden lg:flex h-full w-auto mx-auto lg:mx-0 aspect-square border-[0.02rem] contrast-200 border-solid border-white rounded-lg"
                src={props.imageSrc}
                alt="user avatar"
                width={450}
                height={450}
            />
            ) : (
                <div className="hidden lg:flex h-full w-auto mx-auto lg:mx-0 aspect-square border-[0.02rem] contrast-200 border-solid border-white rounded-lg text-white bg-black">
                    {props.userName.charAt(0).toUpperCase()}
                </div>
            )}
            <a href="#" onClick={handleSignOut} className="flex lg:hidden h-full w-full max-w-full m-1 text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white">
                <div className="m-auto h-full">LOGOUT</div>
            </a>
            <div className="hidden lg:flex flex-col w-full h-full text-white overflow-hidden gap-1">
                <h3 className="md:text-md lg:text-2xl truncate">
                    {props.userName}
                </h3>
                <a href="#" onClick={handleSignOut} className="text-center text-white bg-black transition-colors ease-in-out duration-500 hover:bg-white hover:text-black border-2 border-white w-fit px-3 py-1">
                Sign Out
                </a>
            </div>
        </div>
        </>
    )
};

export default UserProfile;