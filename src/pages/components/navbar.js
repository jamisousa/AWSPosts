import Link from "next/link";
import React from "react";
import '../../../configureAmplify';
import { useState, useEffect } from "react";
import { Auth, Hub } from "aws-amplify";

const Navbar = () => {
    const [signedUser, setSignedUser] = useState(false);

    useEffect(()=>{
        authListener();
    },[])

    async function authListener(){
        Hub.listen("auth",(data)=>{
            switch(data.payload.event){
                case "signIn":
                    return setSignedUser(true);
                case "signOut":
                    return setSignedUser(false);
                
            }
        })
        try{
            await Auth.currentAuthenticatedUser();
            setSignedUser(true);
        }catch(err){

        }
    }

    return(
        <nav className="flex justify-center pt-3 pb-3 space-x-4 border-b bg-pink-400 border-gray-400">
            {[
                ["Home", "/"],
                ["Create Post", "/create-post"],
                ["Profile", "/profile"]
            ].map(([title,url], index)=>(
                <Link legacyBehavior href={url} key={index} className='rounded-lg px-3 py-2 text-slate-700 font-bold font-medium hover:bg-slage-100 hover:text-slate-900'>
                    {title}
                </Link>
                
            ))}

            {
                signedUser && (
                    <div>
                        <Link href='/my-posts' className='rounded-lg text-slate-700 font-medium hover:bg-slage-100 hover:text-slate-900'>
                        My Posts
                        </Link>
                    </div>
                )
            }

        </nav>
    );

}

export default Navbar;