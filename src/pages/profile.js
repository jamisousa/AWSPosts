import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import '@aws-amplify/ui-react/styles.css';

function Profile({ signOut }){
    const [user,setUser] = useState(null);

    useEffect(()=>{
        checkUser();
    },[])

    async function checkUser(){
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
    }

    if(!user) return null;

    return (
        <div>
            <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
            <h1 className="font-medium text-gray-500 my-2">Username: {user.username}</h1>
            <h1 className="font-small text-gray-500 my-2">Email: {user.attributes.email}</h1>
            <button className="mt-0.5 bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 border border-pink-700 rounded" onClick={signOut}>Sign out</button>
        </div>
    )

}

export default withAuthenticator(Profile);