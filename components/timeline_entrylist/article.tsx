import { getDiffTime, SERVERDOMAIN, throttle } from "@/utils"
import { useEffect, useState } from "react"
import Image from "next/image"
import Styles from "../timeline_entrylist/timeline_entrylist.module.scss"
import axios from "axios"
import router, { useRouter } from "next/router"

function Article({ articleInitial,handlerLoading,article_tab }: any): JSX.Element {
  const [dislike, setDislike] = useState([0])
  const [articles,setArticles]=useState(articleInitial)
  const [page, setPage] = useState(5)
  const router=useRouter()
  const bignav=router.query.Bignav
  let smallnav=router.query.SmallNav as string
  if(smallnav!=undefined){
    smallnav=smallnav.replace('_','')
  }
  const handlerScroll = throttle(async () => {
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
      handlerLoading(true)
      let advertisement 
      if(article_tab==1)
      { 
        advertisement= await axios.get(
        `http://101.42.229.5:1337/api/articles?${bignav==undefined?"":"filters[article_type_tabs][id]="}${bignav}&${smallnav==undefined?"":"filters[tags][id]="}${smallnav}&pagination[page]=${page}&pagination[pageSize]=5&populate=*`
          );}
      if(article_tab==2)
      {advertisement= await axios.get(
        `http://101.42.229.5:1337/api/articles?${bignav==undefined?"":"filters[article_type_tabs][id]="}${bignav}&${smallnav==undefined?"":"filters[tags][id]="}${smallnav}&sort[0]=updatedAt:desc&pagination[page]=${page}&pagination[pageSize]=5&populate=*`
      );}
      if(article_tab==3)
      {advertisement= await axios.get(
        `http://101.42.229.5:1337/api/articles?${bignav==undefined?"":"filters[article_type_tabs][id]="}${bignav}&${smallnav==undefined?"":"filters[tags][id]="}${smallnav}&sort[0]=view_count:desc&pagination[page]=${page}&pagination[pageSize]=5&populate=*`
      );}
      for (let i = 0; i < advertisement.data.data.length; i++) {
        advertisement.data.data[i].attributes.date = getDiffTime(
          advertisement.data.data[i].attributes.updatedAt
        )
      }
      setArticles([...articles, ...advertisement.data.data])
      setPage(page + 1)
      handlerLoading(false)
    }
  }, 250);
  useEffect(()=>{setArticles(articleInitial)},[articleInitial])

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("scroll", handlerScroll)
      return () => {
        document.removeEventListener("scroll", handlerScroll)
      }
    }
  })
  const goDetail = async(postId)=>{
    const data = axios.get(`http://101.42.229.5:1337/api/articles/${postId}/?populate=*`)
    const id = (await data).data.data.attributes.article_detail.data.id
    // router.push(`/article/${id}`)
    //打开新标签页（与掘金一样）
    window.open(`/article/${id}`)
  }
  return (
    <div>
      {articles.map((post: any) => (
        <li
          key={post.attributes.title}
          className={`${
            dislike.indexOf(post.id) == -1 ? Styles.item : Styles.none
          }`}
          onClick={() => {
           goDetail(post.id)
          }}
        >
          <div className={Styles.advertisement}>
            <div className={`${Styles.meta_container}`}>
              <div className={Styles.user_message}>
                <a className={Styles.userbox}>
                  <div className={Styles.popper_box}>
                    {post.attributes.userName}
                  </div>
                </a>
              </div>
              <div className={Styles.dividing}></div>
              <div className={Styles.date}>{post.attributes.date}</div>
              <div
                className={`${
                  post.attributes.ad ? Styles.none : Styles.tag_list
                }`}
              >
                {`${post.attributes.article_type_tabs.data}`.length == 0 &&
                `${post.attributes.tags.data}`.length == 0 ? null : (
                  <div
                    className={`${
                      post.attributes.ad ? Styles.none : Styles.dividing_left
                    }`}
                  ></div>
                )}

                {`${post.attributes.article_type_tabs.data}`.length == 0 ||
                `${post.attributes.tags.data}`.length != 0
                  ? null
                  : post.attributes.article_type_tabs.data.map((tab: any) => (
                      <a key={tab.id} className={Styles.tag}>
                        {tab.attributes.title}
                      </a>
                    ))}
                {`${post.attributes.tags.data}` == "null"
                  ? null
                  : post.attributes.tags.data.map((tag: any) => (
                      <a key={tag.id} className={Styles.tag}>
                        {tag.attributes.title}
                      </a>
                    ))}
              </div>
              <div
                className={`${
                  post.attributes.ad ? Styles.is_ad : Styles.not_ad
                }`}
              >
                广告
              </div>
              <div
                className={`${
                  post.attributes.ad ? Styles.not_article : Styles.is_article
                }`}
                onClick={(e) => {
                  setDislike([...dislike, post.id])
                  e.stopPropagation()
                }}
              >
                <Image width={15} height={15} alt="X" src="/images/cross.svg" />
              </div>
            </div>

            <div className={Styles.main}>
              <div className={Styles.info_box}>
                <a className={Styles.title}>{post.attributes.title}</a>
                <a className={Styles.description}>{post.attributes.brief}</a>
              </div>

              {`${post.attributes.image.data}` == "null" ? (
                <div className={Styles.blank}></div>
              ) : (
                <Image
                  alt="广告位"
                  width={120}
                  height={80}
                  className={`${Styles.lazy} ${Styles.thumb}`}
                  src={`${SERVERDOMAIN}${post.attributes.image.data[0].attributes.url}`}
                />
              )}
            </div>
          </div>
        </li>
      ))}
    </div>
  )
}

export default Article
