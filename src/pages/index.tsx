import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { Silkscreen } from '@next/font/google';
import { Oxanium } from '@next/font/google';
import { useEffect, useRef, useState } from "react";

import type { Group, Message, User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const silkscreen = Silkscreen({weight: ["400", "700"], subsets: ['latin']});
const oxanium = Oxanium({subsets: ['latin']});

const Home: NextPage<{currentUser: User, groupsWithMessages: {group: Group, messages: Message[]}[]}> = ({currentUser, groupsWithMessages}) => {
  const [currentGroup, setCurrentGroup] = useState<Group>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [gwm, setGwm] = useState(groupsWithMessages);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>();

  const textAreaRef = useRef<HTMLDivElement>(null);
  const chatViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatViewRef.current?.scrollTo(0, chatViewRef.current.scrollHeight);
  })

  useEffect(() => {
    if (currentGroupIndex === undefined) return;
    const newGwm = [...gwm];
    newGwm[currentGroupIndex]!.messages = messages;
    setGwm(newGwm);
  }, [currentGroupIndex, messages])

  const onClickGroup = (groupId: number) => {
    const groupIndex = gwm.findIndex((groupsWithMessages) => groupsWithMessages.group.id === groupId);
    setCurrentGroupIndex(groupIndex);
    const newGroupWithMessages = groupsWithMessages[groupIndex];
    const messages = newGroupWithMessages?.messages ?? [];
    setCurrentGroup(newGroupWithMessages?.group);
    setMessages(messages);
  }

  const onClickSend = () => {
    const message = textAreaRef.current?.innerText;
    if (!message || !currentGroup || !currentUser) return;
    sendMessage(message, currentUser.id, currentGroup.id);
    textAreaRef.current.innerText = '';
  };

  const sendMessage = async (message: string, userId: string, groupId: number) => {
    if (!currentGroup) return;
    const request = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, groupId, userId
      })
    };
    const newMessage = await fetch('/api/messages', request);
    if (newMessage.status != 200) {
      console.error("Message failed to send");
      return;
    }
    const messageSent = await newMessage.json();
    const m: Message = {...messageSent}
    setMessages(messages.concat(m));
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
            {gwm.map((groupWM) => 
              <div 
              key={groupWM.group.id} 
              className="flex flex-row items-center text-white transition-colors ease-in-out duration-500 hover:bg-white hover:text-black p-2 mx-5 gap-2"
              onClick={() => onClickGroup(groupWM.group.id)}>
                {groupWM.group.iconUrl ? (
                    <Image 
                    className="h-14 w-auto aspect-square object-contain grayscale border-[0.01rem] border-solid"
                    src={groupWM.group.iconUrl} 
                    alt="group icon"
                    width={460} 
                    height={460} /> 
                  ) : (
                    <div className="bg-black border-[0.01rem] border-solid h-14 w-auto aspect-square" />
                )}
                <div className="overflow-hidden hidden md:block">
                  <h4 className={ `truncate text-lg` /*${groupWM.read ? "font-thin" : "font-bold"}`*/}>
                    {groupWM.group.name}
                  </h4>
                  <p className={`truncate` /*${groupWM.read ? "font-thin" : "font-bold"}`*/}>
                    {groupWM.messages[groupWM.messages.length-1]?.message}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/** User Profile */}
          <div className="flex flex-row h-[13vh] w-full items-center bg-black border-white border-solid border-t-2 gap-4 mt-auto p-4">
            <Image
              className="h-full w-auto mx-auto lg:mx-0 aspect-square border-[0.02rem] contrast-200 border-solid grayscale border-white rounded-lg"
              src={currentUser.avatarUrl ?? ""}
              alt="user avatar"
              width={450}
              height={450}
            />
            <div className="hidden lg:flex flex-col w-full h-full text-white">
              <h3 className="md:text-md lg:text-2xl">
                  {currentUser.username}
              </h3>
              <div className={`flex-row lg:text-xl font-bold ${silkscreen.className}`}>
                  {currentUser.online ? "Online" : "Offline"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full h-full items-center gap-6">
          {/** Header */}
          <h2 className="flex w-1/2 justify-center m-5 bg-black border-white border-[1px] text-2xl text-white tracking-widest">
            {currentGroup?.name}
          </h2>
          {/** Chat View */}
          <div ref={chatViewRef} className="flex flex-col h-full overflow-y-auto w-full p-4 gap-1 scrollbar">
            {(messages).map((message, idx) =>
              <div key={message.messageId} className={`${message.userId == currentUser.id ? "ml-auto" : "mr-auto"}`}>
                {(idx == messages.length || message.userId != messages[idx - 1]?.userId) ? (
                  <h6 className={`w-full text-md mt-6 text-neutral-600 ${message.userId == currentUser.id ? "text-end" : "text-start"}`}>
                    {message.senderName}
                  </h6>
                ) : undefined}
                <p className={`${message.userId == currentUser.id ? "ml-auto" : "mr-auto"} max-w-[60vw] lg:max-w-[50vw] w-fit p-2 text-lg text-white rounded-md border-[1px] whitespace-pre-wrap`}>
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
                <button className="w-11 aspect-square mt-auto border-[1px] p-2 pl-3" onClick={onClickSend}>
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

const getUserWithGroups = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: { username: username },
    include: { groups: true }
  });

  return user;
}

const getMessagesByGroup = async (prisma: PrismaClient, groupId: number) => {
  const messages = await prisma.message.findMany({
    where: { groupId: groupId }
  });

  return messages;
}

const getMembersByGroup = async (prisma: PrismaClient, groupId: number) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true }
  });

  if (!group) {
    return null;
  }

  return group.members;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const prisma = new PrismaClient();
  try {
    const currentUserWithGroups = await getUserWithGroups(prisma, "testUserA");
    const currentUser = currentUserWithGroups as User;
    const groupsList = currentUserWithGroups?.groups ?? [];
    const groupsWithMessagesPromise = groupsList?.map(async (group) => {
      return {group: group, messages: await getMessagesByGroup(prisma, group.id)}
    });
    const groupsWithMessages = await Promise.all(groupsWithMessagesPromise)
    return { props: { currentUser , groupsWithMessages: JSON.parse(JSON.stringify(groupsWithMessages)) } };
  } catch(e) {
    console.error(e)
    return {props: {}};
  } finally {
    prisma.$disconnect();
  }
}

export default Home;