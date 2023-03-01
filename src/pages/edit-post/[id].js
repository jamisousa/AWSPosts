import { withAuthenticator } from "@aws-amplify/ui-react";
import { useState, useRef, React, useEffect } from "react";
import {API} from 'aws-amplify';
import { useRouter } from "next/router";
import {v4 as uuid} from 'uuid';
import { createPost, updatePost } from "@/graphql/mutations";
import dynamic from "next/dynamic";
import { Storage } from "aws-amplify";

const SimpleMdeEditor = dynamic(
	() => import("react-simplemde-editor"),
	{ ssr: false }
);
import "easymde/dist/easymde.min.css";
import { getPost } from "@/graphql/queries";

function EditPost(){
    const [post, setPost] = useState(null);
    const router = useRouter();
    const {id} = router.query;
    const fileInput = useRef(null);
    const [coverImage, setCoverImage] = useState(null);
    const [localImage, setLocalImage] = useState(null);

    useEffect(()=>{
        fetchPost();

        async function fetchPost(){
            if(!id) return;
            const postData = await API.graphql({
                query: getPost,
                variables:{id}
            })
            setPost(postData.data.getPost);
            if(postData.data.getPost.coverImage){
                updateCoverImage(postData.data.getPost.coverImage);
            }
        }

    },[id])

    if(!post) return null;

    async function updateCoverImage(coverImage){
        const imageKey = await Storage.get(coverImage);
        setCoverImage(imageKey);
    }

    async function uploadImage(){
        fileInput.current.click();

    }

    function handleChange(e){
        const fileUpload = e.target.files[0];
        if(!fileUpload) return;
        setCoverImage(fileUpload);
        setLocalImage(URL.createObjectURL(fileUpload));
    }

    function onChange(e){
        setPost(()=>({...post, [e.target.name] : e.target.value}))
    }

    const {title, content} = post;

    async function updateCurrentPost(){
        if(!title || !content) return;
        const postUpdated = {
            id,
            content,
            title
        }

        if(coverImage && localImage){
            const fileName = `${coverImage.name}_${uuid()}`
            postUpdated.coverImage = fileName;
            await Storage.put(fileName, coverImage)
        }

        await API.graphql({
            query: updatePost,
            variables:{input: postUpdated},
            authMode: "AMAZON_COGNITO_USER_POOLS"
        })
        router.push(`/my-posts`);
    }


    return (
        <div>
            <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">Edit post</h1>
            {coverImage && <img src={localImage ? localImage:coverImage} className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0"/> }
            <input onChange={onChange} name="title" placeholder="Title" value={post.title} className="border-b pb-2 text-lg my-4 text-gray-500 placeholder-gray-500 y-2"/>
            <SimpleMdeEditor value={post.content} onChange={(value)=>setPost({...post, content: value})}/>
            <input type="file" ref={fileInput} className="absolute w-0 h-0" onChange={handleChange
            } />
            <button onClick={uploadImage} className="mb-4 bg-pink-600 text-white font-semibold px-8 py-2 rounded-lg">Upload Image</button>
            {" "}
            <button onClick={updateCurrentPost} className="mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg">Update Post</button>
        </div>
    )
}

export default EditPost;