import {Response, Request} from 'express'
import {SETTINGS} from "../settings"
import {ObjectId} from "mongodb";
import {postsService} from "../domain/posts-service";
import {blogsQueryRepository} from "../query-repositories/blogs-query-repository";
import {postsQueryRepository} from "../query-repositories/posts-query-repository";
import {Paginator, PostDBModel, PostViewModel} from "../input-output-types/post-types";
import {CommonQueryModel, getPageOptions} from "../input-output-types/pagination-sorting";


export const getPostsController = async (req: Request<{},{},{},CommonQueryModel>, res: Response) => {
    const {pageNumber, pageSize, sortBy, sortDirection} = getPageOptions(req.query);

    const foundPosts: Paginator<PostViewModel> = await postsQueryRepository.findPosts(pageNumber, pageSize,
        sortBy, sortDirection)

    return res.status(SETTINGS.HTTP_STATUSES.OK_200).send(foundPosts)
}

export const postPostController = async (req: Request, res: Response) => {
    const postInDB = await postsService.createPost(req.body)
    const post: PostViewModel | null = await postsQueryRepository.findPostById(postInDB._id)
    return res.status(SETTINGS.HTTP_STATUSES.CREATED_201).send(post);
}

export const findPostController = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    if (!ObjectId.isValid(postId)) {
        return res.status(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400).send("Invalid ObjectId format");
    }

    const foundPost: PostViewModel | null = await postsQueryRepository.findPostById(postId)
    if (!foundPost) return res.sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
    return res.status(SETTINGS.HTTP_STATUSES.OK_200).send(foundPost)
}

export const updatePostController = async (req: Request, res: Response) => {
    const blog = await blogsQueryRepository.findBlogById(req.body.blogId)
    if (!blog) {
        return res.status(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400).send("Blog not exist");
    }

    const postId = req.params.postId;
    if (!ObjectId.isValid(postId)) {
        return res.status(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400).send("Invalid ObjectId format");
    }

    const isUpdated: boolean = await postsService.updatePost(postId, req.body)
    if (isUpdated) {
        const post: PostViewModel | null = await postsQueryRepository.findPostById(postId)
        return res.status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204).send(post)
    }
    return res.sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
}

export const deletePostController = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    if (!ObjectId.isValid(postId)) {
        return res.status(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400).send("Invalid ObjectId format");
    }

    const isDeleted: boolean = await postsService.deletePost(postId)
    if (isDeleted) {
        return res.sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
    }
    return res.sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)
}
