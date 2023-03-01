import {useState, useEffect} from 'react';
import {API, Storage} from 'aws-amplify';
import {listPosts} from '../graphql/queries';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(()=>{
    fetchPosts();
  },[])

  async function fetchPosts(){
    const postsData = await API.graphql({
      query: listPosts
    })
    const {items} = postsData.data.listPosts;
    const postsWithImages = await Promise.all(
      items.map(async(post)=>{
        if(post.coverImage){
          post.coverImage = await Storage.get(post.coverImage);
        }
        return post;
      })
    )
    setPosts(postsWithImages);
  }

  return (
      <div>
        <h1 className='text-pink-800 text-3xl font-bold tracking-wide mt-6 mb-2'>AWSPosts</h1>
        <h1 className='text-pink-600 text-1xl font-bold tracking-wide mt-2 mb-2'>Create cool posts and comment on other people's content</h1>
        <hr></hr>
        <h1 className='text-pink-900 text-2xl font-bold tracking-wide mt-7 mb-2'>Latest posts:</h1>
        <div className='py-2'></div>
        {
        posts.map((post, index)=>(
          <Link key={index} href={`/posts/${post.id}`}>
            <div className='my-8 pb-8 border-b border-pink-300 px-2 py-2 pb4 bg-white rounded-lg'>
              {post.coverImage && (
                <img src={post.coverImage}
                className="m-2 w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0" />
              )}
              <div className='m-2 cursor-pointer border=b border-gray-300 mt-8 pb4'>
                <h2 className='text-xl font-semibold' key={index}>{post.title}</h2>
                <p className="text-gray-500 mt-2 font-semibold">Author: {post.username}</p>
              </div>
            </div>
          </Link>
        )
        )}
      </div>
  
  )
}
