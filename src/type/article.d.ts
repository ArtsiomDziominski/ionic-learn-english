export type Article = {
    id: string,
    title: string,
    description: string,
    body: string,
    img: string,
    publishedTime?: string,
    modifiedTime?: string,
    author?: string
};

export as namespace ARTICLE;