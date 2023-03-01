import { API, Storage } from "aws-amplify";
import { useRouter } from "next/router";
import reactMarkdown from "react-markdown";
import '../../../configureAmplify';
import { listPosts, getPost } from "@/graphql/queries";
import { useEffect, useState } from "react";
import { createComment } from "@/graphql/mutations";
import dynamic from "next/dynamic";
import { v4 as uuid } from "uuid";

const SimpleMdeEditor = dynamic(
	() => import("react-simplemde-editor"),
	{ ssr: false }
);
import "easymde/dist/easymde.min.css";

export default function Post({post}){
    const [coverImage, setCoverImage] = useState(null);
    const router = useRouter();
    const initialState = {message: ""}
    const [comment, setComment] = useState(initialState);
    const [showMe, setShowMe] = useState(false);
    const {message} = comment;
    const [error, setError] = useState(null);
    const [signedInUser, setSignedInUser] = useState(false);


    function toggle() {
      setShowMe(!showMe);
    }
  

    useEffect(()=>{
      updateCoverImage();
    },[]);

      //check for a logged in user or not
      useEffect(() => {
        authListener();
      }, []); //check when app is loaded/mounted too!


      async function authListener() {
        Hub.listen("auth", (data) => {
          switch (data.payload.event) {
            case "signIn":
              return setSignedInUser(true);
            case "signOut":
              return setSignedInUser(false);
          }
        });
        try {
          await Auth.currentAuthenticatedUser();
          setSignedInUser(true);
        } catch (err) {}
      }

    async function updateCoverImage(){
      if(post.coverImage){
        const imageKey = await Storage.get(post.coverImage);
        setCoverImage(imageKey);
      }
    }

    if(router.isFallback){
        return <div>Loading...</div>
    }

    async function createAComment() {
      if (!message) return;
      const id = uuid();
      comment.id = id;
      try {
        await API.graphql({
          query: createComment,
          variables: { input: comment },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        });
      } catch (error) {
        console.log(error);
        setError(error);
      }
      // router.push("/my-posts");
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
            <div>
              
            </div>
            <br></br>
            { signedInUser && (<button type="button" className="rounded-lg py-2 px-8 font-semibold text-white bg-pink-600 mb-4" onClick={toggle}>Write a comment</button>)
            }
            {error && <p className="text-red-500">Unable to add comment. {error.message}</p>}

            {
          <div style={{ display: showMe ? "block" : "none" }}>
            <SimpleMdeEditor
              value={comment.message}
              onChange={(value) =>
                setComment({ ...comment, message: value, postID: post.id })
              }
            />
            <button
              onClick={createAComment}
              type='button'
              className='mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg'
            >
              Save
            </button>
          </div>
        }
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