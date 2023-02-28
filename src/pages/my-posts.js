import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { postsByUsername } from "@/graphql/queries";
import Link from "next/link";
import Moment from "moment";
import { deletePost as deletePostMutation } from "@/graphql/mutations";

export default function MyPosts() {

    const [posts, setPosts] = useState([]);
    useEffect(() => {
      fetchPosts();
    }, []);

    async function fetchPosts(){
      const { username, attributes: { sub } } = await Auth.currentAuthenticatedUser()
      const parsed = sub + "::" + username;
      const postData = await API.graphql({
          query: postsByUsername,
          variables: { username: parsed }
      })
   
      setPosts(postData.data.postsByUsername.items)
    }

    async function deletePost(id){
      await API.graphql({
        query: deletePostMutation,
        variables: {input: {id}},
        authMode: "AMAZON_COGNITO_USER_POOLS"
      })
      fetchPosts();
    }
  
    return (
        <div>
            <h1 className="py-2 px-2 max-w-xxl text-pink font-bold">My Created Posts</h1>
          {posts.map((post, index) => (
            <div
              key={index}
              className='py-8 px-8 max-w-xxl mx-auto bg-white rounded-xl shadow-lg space-y-2 sm:py-1 sm:flex 
              sm:items-center sm:space-y-0 sm:space-x-6 mb-2'
            >
             
              <div className='text-center space-y-2 sm:text-left'>
                <div className='space-y-0.5'>
                  <p className='text-lg text-black font-semibold'>{post.title}</p>
                  <p className='text-slate-500 font-medium'>
                    Created on: {Moment(post.createdAt).format("ddd, MMM hh:mm a")}
                  </p>
                </div>
                <div
                  className='sm:py-4 sm:flex 
            sm:items-center sm:space-y-0 sm:space-x-1'
                >
                  <p
                    className='px-4 py-1 text-sm text-pink-600 font-semibold rounded-full border border-purple-200 
        hover:text-white hover:bg-pink-600 hover:border-transparent focus:outline-none 
        focus:ring-2 focus:ring-pink-600 focus:ring-offset-2'
                  >
                    <Link href={`/edit-post/${post.id}`}>Edit Post</Link>
                  </p>
    
                  <p
                    className='px-4 py-1 text-sm text-pink-600 font-semibold rounded-full border border-purple-200 
        hover:text-white hover:bg-pink-600 hover:border-transparent focus:outline-none 
        focus:ring-2 focus:ring-pink-600 focus:ring-offset-2'
                  >
                    <Link href={`/posts/${post.id}`}>View Post</Link>
                  </p>
    
                  <button
                    className='text-sm mr-4 text-red-400 px-3'
                    onClick={() => deletePost(post.id)}
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

}