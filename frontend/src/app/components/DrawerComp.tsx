"use client";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "./ui/drawer";
import React from 'react'

const DrawerComp = () => {
  return (           
    <Drawer>   
      <DrawerTrigger>
        <div className="px-4 py-2 bg-blue-500 text-white rounded">Open Task</div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Task Details</DrawerTitle>
        <p>Your task details go here...</p>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerComp