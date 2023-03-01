import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import reactMarkdown from "react-markdown";
import '../../../configureAmplify';
import { listPosts, getPost } from "@/graphql/queries";
import { useEffect, useState } from "react";

export default function Post({post}){
    const [coverImage, setCoverImage] = useState(null);
    const router = useRouter();

    useEffect(()=>{
      updateCoverImage();
    },[]);

    async function updateCoverImage(){
      if(post.coverImage){
        const imageKey = await Storage.get(post.coverImage);
        setCoverImage(imageKey);
      }
    }

    if(router.isFallback){
        return <div>Loading...</div>
    }
    
    return(
        <div>
            <h1 className="text-4xl mt-4 font-semibold tracing-wide">{post.title}</h1>
            {" "}
            <br></br>
            {
              coverImage && (
                <img src={coverImage}
                className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0"/>
              )
            }
            <div>
                <h2 reactMarkdown="prose" className="text-2xl">{post.content}</h2>
            </div>
            <p className="text-sm font-light my-4">By {post.username}</p>

        </div>
    );
}

export async function getStaticPaths() {
    const postData = await API.graphql({
      query: listPosts
    })
    const paths = postData.data.listPosts.items.map(post => ({ params: { id: post.id }}))
    return {
      paths,
      fallback: true
    }
  }
  
  export async function getStaticProps({ params }) {
    const { id } = params;
    const postData = await API.graphql({
      query: getPost,
      variables: { id },
    });
    return {
      props: {
        post: postData.data.getPost,
      },
      revalidate: 1,
    };
  }