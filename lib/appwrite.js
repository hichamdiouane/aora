import { Client, Account, Avatars, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.hicham.aura',
    projectId: '667ad121000e10df6996',
    databaseId: '667ad421000575501a39',
    userCollectionId: '667ad48d000b22bd3b09',
    videoCollectionId: '667ad4d80015d402fe65',
    storageId: '667ad8a600343ae35208'
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
    .setProject(appwriteConfig.projectId) // Your project ID
    .setPlatform(appwriteConfig.platform) // Your application ID or bundle ID.


const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register User
export const createUser = async(email, password, username) => {
    try{
        const newAccount = await account.create(ID.unique(), email, password, username);
        
        if(!newAccount) throw Error
        
        const avatarUrl = avatars.getInitials(username)
        
        await signIn(email, password)
        
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
            }
        )
    }catch(error){
        console.log(error)
        throw new Error(error)
    }
}

// Sign In function
export async function signIn(email, password){
    try{
        const session = await account.createEmailPasswordSession(email, password)
        return session
    }catch(error){
        throw new Error(error)
    }
}

// Get current user
export const getCurrentUser = async () =>{
    try{
        const currentAccount = await account.get()

        if(!currentAccount) throw error

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw error

        return currentUser.documents[0]
    }catch(error){
        console.log(error)
    }
}

// Get all posts
export const getAllPosts = async () =>{
    try{
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc('$createdAt')]
        )

        return posts.documents
    }catch(error){
        throw new Error(error)
    }
}

// Get latest posts
export const getLatestPosts = async () =>{
    try{
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )

        return posts.documents
    }catch(error){
        throw new Error(error)
    }
}

// Get search posts
export const searchPosts = async (query) =>{
    try{
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.search('title', query)]
        )

        return posts.documents
    }catch(error){
        throw new Error(error)
    }
}

// Get user posts
export const getUserPosts = async (id) =>{
    try{
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.equal('creator', id)]
        )

        return posts.documents
    }catch(error){
        throw new Error(error)
    }
}

// Sign out
export const signOut = async() => {
    try {
      const session = await account.deleteSession("current");
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
    let fileUrl;
  
    try {
      if (type === "video") {
        fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
      } else if (type === "image") {
        fileUrl = storage.getFilePreview(
          appwriteConfig.storageId,
          fileId,
          2000,
          2000,
          "top",
          100
        );
      } else {
        throw new Error("Invalid file type");
      }
  
      if (!fileUrl) throw Error;
  
      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }
}

// Upload File
export async function uploadFile(file, type) {
    if (!file) return;
  
    // const asset = { 
    //     name: 'file.fileName',
    //     type: 'file.mimeType',
    //     size: 'file.fileSize',
    //     uri: 'file.uri',
    // };

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest };
  
    console.log(file)
    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        asset
      );
      console.log(uploadedFile)
      const fileUrl = await getFilePreview(uploadedFile.$id, type);
      return fileUrl;
    } catch (error) {
      throw new Error(error);
    }
}

// Create Video Post
export async function createVideoPost(form) {
    try {
      const [thumbnailUrl, videoUrl] = await Promise.all([
        uploadFile(form.thumbnail, "image"),
        uploadFile(form.video, "video"),
      ]);
  
      const newPost = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.videoCollectionId,
        ID.unique(),
        {
          title: form.title,
          thumbnail: thumbnailUrl,
          video: videoUrl,
          prompt: form.prompt,
          creator: form.userId,
        }
      );
  
      return newPost;
    } catch (error) {
      throw new Error(error);
    }
}