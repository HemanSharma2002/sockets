"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { IoMdSend } from "react-icons/io";
import { CgProfile } from "react-icons/cg";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { io } from "socket.io-client"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { start } from "repl";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  message: z.string(),
})

interface Message {
  sender: string,
  content: string
}

export default function Home() {
  const [array, setarray] = useState<Array<string>>([])
  const [messages, setmessages] = useState<Array<Message>>([])
  const [username, setusername] = useState("")
  const [input, setinput] = useState("")
  const socket = useMemo(() => io(), [])
  const messageBox = useRef<HTMLDivElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  function moveDown() {
    if (messageBox !== null) {
      messageBox.current?.scrollTo(
        {
          top: messageBox.current.scrollHeight
        }
      )
    }
  }
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.message === "") {

      moveDown()

      return
    }
    form.setValue("message", "")
    const message: Message = {
      sender: username,
      content: values.message
    }
    socket.emit("send-message", message)
  }


  useLayoutEffect(() => {
    for (let i = 0; i < 1000; i++) {
      setarray(prev => [...prev, String(i)])
    }
    socket.on('welcome', (message) => {
      console.log(message);
    })
    socket.on("recieve-message", (message: Message) => {
      setmessages(prev => [...prev, message])
      moveDown()

    })
    return () => {
      socket.disconnect()
    }
  }, [])
  return (
    <main className="p-3 w-full h-full">
      {
        username === "" ?
          <main className=" flex flex-col gap-5">
            <div className=" w-full h-full flex flex-col items-center">
            <Label className="  bg-blue-950 text-white p-2 rounded-md text-center w-full">Welcome to socketMessage</Label>
            </div>
            <Label className=" text-blue-950">Enter a username to proceed</Label>
            <div className=" flex flex-row gap-3 h-[10vh] w-full">
              <Input value={input} onChange={e => setinput(e.target.value)} placeholder="Username" />
              <Button variant={"secondary"} onClick={() => {
                setusername(input)
                socket.emit("set-username", username)
              }}><CgProfile className=" text-xl" /></Button>
            </div>
          </main> :
          <div className=" w-full h-full">
            <div className=" w-full h-full flex flex-col items-center">
            <Label className="  bg-blue-950 text-white p-2 rounded-md text-center w-full">Welcome to socketMessage</Label>
            </div>
            <div className=" w-full h-[85vh] overflow-y-scroll" id="messageBox" ref={messageBox}>
              {
                messages.map(
                  message => (
                    <div key={message.content} className={`w-full p-2 ${username === message.sender ? " flex flex-row justify-end" : " flex flex-row justify-start "}`}>
                      <div className={` max-w-1/2  `}>
                        <div className={` bg-blue-950 max-w-full   text-white p-2 rounded-sm } flex flex-col gap-2`}>
                       
                          <p>
                            {message.content}
                          </p>
                          <p className="text-[7px] text-end">~{message.sender}</p>
                          
                        </div>
                      </div>
                    </div>
                  )
                )
              }

            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className=" flex flex-row max-w-full h-[10vh] gap-2">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className=" w-full">
                      <FormControl className=" w-full">
                        <Input placeholder="Message" className=" w-full" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant={"secondary"}><IoMdSend className=" text-2xl" /></Button>
              </form>
            </Form>
          </div>

      }
    </main>
  );
}

