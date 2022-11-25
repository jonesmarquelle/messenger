import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { Silkscreen } from '@next/font/google';
import { Oxanium } from '@next/font/google';
import { useEffect, useRef, useState } from "react";

const silkscreen = Silkscreen({weight: ["400", "700"], subsets: ['latin']});
const oxanium = Oxanium({subsets: ['latin']});

interface UserProps {
  id: string,
  username: string,
  avatar: string,
  active: boolean
}

interface MessageProps {
  user: UserProps,
  timestamp: number,
  message: string
}

interface GroupProps {
  id: string, 
  groupName: string, 
  icon: string, 
  recentMessage: string, 
  read: boolean
}

interface ServerSideProps {
    groupsList: GroupProps[],
    currentGroup: GroupProps,
    testMessages: MessageProps[],
    currentUser: UserProps
}

const Home: NextPage<ServerSideProps> = ({groupsList, currentGroup, testMessages, currentUser}) => {
  const [messages, setMessages] = useState<MessageProps[]>(testMessages);

  const textAreaRef = useRef<HTMLDivElement>(null);
  const chatViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatViewRef.current?.scrollTo(0,0);
  })

  const onClickSend = () => {
    const message = textAreaRef.current?.innerText;
    if (!message) return;
    sendMessage(message);
    textAreaRef.current.innerText = '';
  };

  const sendMessage = (message: string) => {
    const newMessage = {
      user: currentUser,
      timestamp: new Date().getMilliseconds(),
      message: message
    };
    setMessages([newMessage].concat(messages));
  };

  return (
    <>
      <Head>
        <title>Vitesi</title>
        <meta name="description" content="Messaging App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`flex flex-row h-screen w-screen bg-black ${oxanium.className}`}>
        {/** Sidebar */}
        <div className="flex flex-col w-1/4 h-full border-r-2">
          <div className="flex flex-col w-full h-full pt-5 gap-2 overflow-y-auto scrollbar">
            {groupsList.map((group) => 
              <div key={group.id} className="flex flex-row items-center text-white transition-colors ease-in-out duration-500 hover:bg-white hover:text-black p-2 mx-5 gap-2">
                {group.icon ? (
                    <Image 
                    className="h-14 w-auto aspect-square object-contain grayscale border-[0.01rem] border-solid"
                    src={group.icon} 
                    alt="group icon"
                    width={460} 
                    height={460} /> 
                  ) : (
                    <div className="bg-black border-[0.01rem] border-solid h-14 w-auto aspect-square" />
                )}
                <div className="overflow-hidden hidden md:block">
                  <h4 className={ `truncate text-lg ${group.read ? "font-thin" : "font-bold"}`}>
                      {group.groupName}
                  </h4>
                  <p className={`truncate ${group.read ? "font-thin" : "font-bold"}`}>
                    {group.recentMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/** User Profile */}
          <div className="flex flex-row h-[13vh] w-full items-center bg-black border-white border-solid border-t-2 gap-4 mt-auto p-4">
            <Image
              className="h-full w-auto mx-auto lg:mx-0 aspect-square border-[0.02rem] contrast-200 border-solid grayscale border-white"
              src={currentUser.avatar}
              alt="user avatar"
              width={450}
              height={450}
            />
            <div className="hidden lg:flex flex-col w-full h-full text-white">
              <h3 className="md:text-md lg:text-2xl">
                  {currentUser.username}
              </h3>
              <div className={`flex-row lg:text-xl font-bold ${silkscreen.className}`}>
                  {currentUser.active ? "Online" : "Offline"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full h-full items-center gap-6">
          {/** Header */}
          <h2 className="flex w-1/2 justify-center m-5 bg-black border-white border-[1px] text-2xl text-white tracking-widest">
            {currentGroup.groupName.toUpperCase()}
          </h2>
          {/** Chat View */}
          <div ref={chatViewRef} className="flex flex-col-reverse overflow-y-auto w-full p-4 gap-1 scrollbar">
            {(messages as MessageProps[]).map((message, idx) => //TODO: Remove index reference
              <div key={message.timestamp} className={`${message.user.id == currentUser.id ? "ml-auto" : "mr-auto"}`}>
                {(idx == messages.length || message.user.id != messages[idx + 1]?.user.id) ? (
                  <h6 className={`w-full text-md mt-6 text-neutral-600 ${message.user.id == currentUser.id ? "text-end" : "text-start"}`}>
                    {message.user.username}
                  </h6>
                ) : undefined}
                <p className={`max-w-[60vw] lg:max-w-[50vw] w-fit p-2 text-lg text-white rounded-md border-[1px] whitespace-pre-wrap`}>
                  {message.message} 
                </p>
              </div>
            )}
            
          </div>
          {/** Text Input Bar */}
          <div
            className="flex flex-row w-full h-fit min-h-[7vh] mt-2 px-4 pb-4 gap-4 items-end">
                {/** Emoji Button */}
                <div className="hidden w-8 aspect-square mt-auto border-[1px]" />
                {/** Attachment Button */}
                <div className="hidden w-8 aspect-square mt-auto border-[1px]" />
                {/** Text Area */}
                <div 
                  className="w-full min-h-[2rem] max-h-[10vh] break-words overflow-x-hidden overflow-y-auto scrollbar resize-none bg-black border-[1px] text-white p-2"
                  ref={textAreaRef}
                  id="textMessage" contentEditable 
                />
                {/** Send Button */}
                <button className="w-11 aspect-square mt-auto border-[1px]" onClick={onClickSend}>
                  <Image 
                    src={"/send.svg"}
                    alt="Send"
                    width={128}
                    height={128}
                  />
                </button>
          </div>
        </div>
      </main>
    </>
  );
};

Home.getInitialProps = async () : Promise<ServerSideProps> => {
  const testUser1 = {id: "A1", username:"Frank Ocean", avatar: "https://thisisrnb.com/wp-content/uploads/2016/08/Frank-Ocean-green-hair.png", active: true}
  const testUser2 = {id: "B2", username:"B Benipal", avatar: "https://github.com/bbenip.png", active: true}

  const testGroups : Array<GroupProps> = [
    {id: "1", groupName: "Baddies Inc.", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Barack_Obama_2016_DNC_%28cropped2%29.jpg", recentMessage: "Barack Obama added you to the chat", read: false},
    {id: "2", groupName: "Trade", icon: testUser2.avatar, recentMessage: "sup", read: true},
    {id: "3", groupName: "Parents", icon: "", recentMessage: "Take out the trash, please!", read: false},
  ]
  const groupsList: GroupProps[] = [
    testGroups[0]!, testGroups[1]!, testGroups[2]!,
    testGroups[2]!, testGroups[2]!, testGroups[2]!, testGroups[2]!, testGroups[2]!, testGroups[2]!,
    testGroups[2]!, testGroups[2]!, testGroups[2]!, testGroups[2]!, testGroups[2]!, testGroups[2]!,
  ];
  const currentGroup = {id: "2", groupName: "Trade", icon: "https://github.com/bbenip.png", recentMessage: "sup", read: true};

  const testMessages = [
    {user: testUser2, timestamp: 9, message:"sup"},
    {user: testUser1, timestamp: 8, message:"hey, are you there?"},
    {user: testUser1, timestamp: 7, message:"actually something came up i can't make it"},
    {user: testUser1, timestamp: 6, message:"yea that sounds good 2 me lets meet up tomorrow at 6pm. let me know if this works for you and ill send you the address"},
    {user: testUser2, timestamp: 5, message:"anyway i was thinking $40 seems like a fair price"},
    {user: testUser2, timestamp: 4, message:"ya i been holding onto this junk for a while"},
    {user: testUser1, timestamp: 3, message:"r u the guy selling the PS Vita?"},
    {user: testUser1, timestamp: 2, message:"multi-line test text\nmulti-line test text\nmulti-line test text\nmulti-line test text"},
    {user: testUser2, timestamp: 1, message:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium sit amet ex ac auctor. Ut eget nisl dui. Sed congue lorem enim, non venenatis magna convallis egestas. Pellentesque varius neque lacus, non consequat nibh pretium at. Curabitur vitae rhoncus leo. Sed eu sollicitudin mi. Pellentesque quis nunc faucibus tellus finibus malesuada. Donec venenatis, nunc ut scelerisque semper, dui turpis sodales quam, non rhoncus tortor eros vel augue.\nEtiam nec velit massa. Donec elementum velit laoreet quam mattis interdum. Proin nisl felis, efficitur ac dolor ut, tincidunt aliquam purus. Vestibulum pellentesque porta mauris, non luctus sapien rutrum sit amet. Pellentesque urna quam, ornare et venenatis vitae, sagittis sed eros. Etiam mauris erat, placerat ut ex id, gravida maximus est. Donec vitae tristique odio. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec non ante vitae augue aliquet tincidunt. Aliquam imperdiet lectus et lorem volutpat egestas. Nulla facilisi. Sed fermentum consectetur tellus sed cursus. Vestibulum ultrices mauris non cursus vestibulum. Aenean convallis eros a erat vestibulum tristique ut ut elit. Curabitur malesuada vulputate nulla eget consectetur."},
  ]

  const currentUser = testUser1;

  // Pass data to the page via props
  return { groupsList, currentGroup, testMessages, currentUser };
}

export default Home;