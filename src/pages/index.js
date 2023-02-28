import {useState, useEffect} from 'react';
import {API} from 'aws-amplify';
import {listPosts} from '../graphql/queries';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(()=>{
    fetchPosts();
  },[])

  async function fetchPosts(){
    const postsData = await API.graphql({
      query: listPosts
    })
    setPosts(postsData.data.listPosts.items);
  }

  return (
      <div>
        <h1 className='text-pink-400 text-3xl font-bold'>My posts</h1>
        <div className='py-2'></div>
        {
        posts.map((post, index)=>(
          <p key={index}>{post.title}</p>
        )
        )}
      </div>
  
  )
}
