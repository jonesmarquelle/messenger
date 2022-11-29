import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import { Oxanium } from '@next/font/google';
import { useEffect, useRef, useState } from "react";

import type { Group, Message, User } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Sidebar from "../components/Sidebar";
import ChatView from "../components/ChatView";
import CreateGroupForm from "../components/CreateGroupForm";
import AddGroupMemberForm from "../components/AddGroupMemberForm";
import CreateGroupCTA from "../components/CreateGroupCTA";

const oxanium = Oxanium({subsets: ['latin']});

export type MessageWithSender = Message & { sender: User; }
export type GroupAndMessages = Group & { messages: MessageWithSender[] }

const Home: NextPage<{currentUser: User, groupsWithMessages: GroupAndMessages[]}> = ({currentUser, groupsWithMessages}) => {
  const [currentGroup, setCurrentGroup] = useState<GroupAndMessages>();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [gwm, setGwm] = useState<GroupAndMessages[]>(groupsWithMessages);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>();

  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [showChatView, setShowChatView] = useState<boolean>(true);
  const [showCreateGroupForm, setShowCreateGroupForm] = useState<boolean>(false);

  const openCreateGroupForm = () => {
    setShowChatView(false);
    setShowCreateGroupForm(true);
  }
  const closeCreateGroupForm = () => {
    setShowCreateGroupForm(false);
    setShowChatView(true);
  }

  const openAddMemberForm = () => {
    setShowChatView(false);
    setShowAddMember(true);
  }
  const closeAddMemberForm = () => {
    setShowAddMember(false);
    setShowChatView(true);
  }

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
    const groupIndex = gwm.findIndex((groupsWithMessages) => groupsWithMessages.id === groupId);
    setCurrentGroupIndex(groupIndex);
    const newGroupWithMessages = groupsWithMessages[groupIndex];
    const messages = newGroupWithMessages?.messages ?? [];
    setCurrentGroup(newGroupWithMessages);
    setMessages(messages);
  };

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
    const m: MessageWithSender = {...messageSent}
    m.sender = currentUser;
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
        <Sidebar 
          userName={currentUser.name} 
          userImageUrl={currentUser.image} 
          groupsAndMessages={gwm} 
          clickGroupFn={onClickGroup} 
          createGroupFn={openCreateGroupForm}
        />
        { currentGroup && showChatView ? 
          <ChatView 
            chatViewRef={chatViewRef} 
            textBoxRef={textAreaRef} 
            groupName={currentGroup?.name} 
            messages={messages} 
            currentUserId={currentUser.id} 
            sendMessageFn={onClickSend} 
          />
          : undefined 
        }
          
        { currentGroupIndex === undefined && showChatView ?
          <CreateGroupCTA showFormFn={openCreateGroupForm}/>
          : undefined
        }

        { showCreateGroupForm ? 
          <CreateGroupForm userId={currentUser.id} closeFn={closeCreateGroupForm} />
          : undefined
        }

        { showAddMember && currentGroup ? 
          <AddGroupMemberForm groupId={currentGroup.id} closeFn={closeAddMemberForm} />
          : undefined 
        }

      </main>
    </>
  );
};

const getUserWithGroups = async (prisma: PrismaClient, id: string) => {
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: { groups: true }
  });

  return user;
}

const getMessagesByGroup = async (prisma: PrismaClient, groupId: number) => {
  const messages: MessageWithSender[] = await prisma.message.findMany({
    where: { groupId: groupId },
    include: {sender: true}
  });

  return messages;
}

const getMembersByGroup = async (prisma: PrismaClient, groupId: number) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true}
  });

  if (!group) {
    return null;
  }

  return group.members;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      }
    }
  }

  const prisma = new PrismaClient();
  try {
    const currentUserWithGroups = await getUserWithGroups(prisma, session.user!.id);
    const currentUser = currentUserWithGroups as User;
    const groupsList = currentUserWithGroups?.groups ?? [];
    const groupsWithMessagesPromise = groupsList?.map(async (group) => {
      return {...group, messages: await getMessagesByGroup(prisma, group.id)}
    });
    const groupsWithMessages = await Promise.all(groupsWithMessagesPromise)
    console.log(groupsWithMessages);
    return { props: { currentUser , groupsWithMessages: JSON.parse(JSON.stringify(groupsWithMessages)) } };
  } catch(e) {
    console.error(e)
    return {props: {}};
  } finally {
    prisma.$disconnect();
  }
}

export default Home;