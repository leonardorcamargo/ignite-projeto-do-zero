/* eslint-disable react/no-danger */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';

import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) return <div>Carregando...</div>;

  const amountOfWords = post.data.content.reduce((acc, cur) => {
    return (
      acc +
      cur.heading.split(' ').length +
      RichText.asText(cur.body).split(' ').length
    );
  }, 0);

  return (
    <>
      <header className={styles.header}>
        <img src={post.data.banner.url} alt="banner" />
      </header>
      <main className={styles.content}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <section className={commonStyles.info}>
          <time className={commonStyles.publicationDate}>
            <FiCalendar className={commonStyles.icon} />
            {format(new Date(post.first_publication_date), 'PP', {
              locale: ptBR,
            })}
          </time>
          <span className={commonStyles.author}>
            <FiUser className={commonStyles.icon} />
            {post.data.author}
          </span>
          <time className={commonStyles.timeToRead}>
            <FiClock className={commonStyles.icon} />
            {Math.ceil(amountOfWords / 200) ?? 0} min
          </time>
        </section>
        <div className={styles.body}>
          {post.data.content.map(item => (
            <section key={item.heading}>
              <h1>{item.heading}</h1>
              {item.body.map((it, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <p key={`${item.heading}_${index}`}>{it.text}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('posts', String(slug), {});

  return {
    redirect: 60 * 30, // 30 minutos
    props: {
      post,
    },
  };
};
