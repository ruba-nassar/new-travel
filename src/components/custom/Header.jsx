import React, { useContext } from "react";
import { Button } from "../ui/button.jsx";
import { LogInContext } from "@/Context/LogInContext/Login.jsx";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu";
import { LogInIcon, LogOutIcon } from 'lucide-react';
import { Link } from "react-router-dom";

function Header() {
  const { user, isAuthenticated, logout, loginWithPopup } = useContext(LogInContext);

  // LogOut function
  const LogOut = () => {
    logout({
      returnTo: `${window.location.origin}/plan-a-trip`, // Ensure this matches the allowed URL in Auth0
    });
  };

  // LogIn function
  const LogIn = () => {
    loginWithPopup();
  };

  return (
    <div className="w-full flex items-center justify-between shadow-sm p-3 md:px-5">
      <div className="logo flex gap-2 items-center justify-between">
        <div className="img inline-block h-5 w-5 md:h-10 md:w-10">
          <img src="/logo.png" alt="Logo" />
        </div>
        <h1 className="text-lg md:text-3xl font-bold">
          Travel Genius
        </h1>
      </div>
      
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="">
            <div className="user flex items-center gap-2 mr-3">
              <h2 className="hidden sm:block font-medium">Hi {user.nickname}</h2>
              <div className="userimg overflow-hidden h-10 w-10 rounded-full">
                <img src={user.picture} alt="User" />
              </div>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className='text-center sm:text-left'>
            <DropdownMenuLabel className='font-semibold text-xl'>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-lg'>
              <Link to='/all-trips'>
                My Trips
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='text-lg'>
              <Link to="/plan-a-trip">
                Create Trip
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='text-lg'>
              <Button onClick={LogOut}>
                Log Out <DropdownMenuShortcut><LogOutIcon className="h-4" /></DropdownMenuShortcut>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={LogIn}>
          Sign In <DropdownMenuShortcut><LogInIcon className="h-4" /></DropdownMenuShortcut>
        </Button>
      )}
    </div>
  );
}

export default Header;
