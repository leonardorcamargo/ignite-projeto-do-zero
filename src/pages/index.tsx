/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  function morePosts() {
    fetch(posts.next_page)
      .then(response => response.json())
      .then(data => {
        setPosts({
          next_page: data.next_page,
          results: [
            ...posts.results,
            ...data.results.map(post => {
              return {
                uid: post.uid,
                first_publication_date: post.first_publication_date,
                data: {
                  title: post.data.title,
                  subtitle: post.data.subtitle,
                  author: post.data.author,
                },
              };
            }),
          ],
        });
      });
  }

  return (
    <main className={commonStyles.container}>
      {posts.results.map(post => {
        return (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.postContent}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
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
              </section>
            </a>
          </Link>
        );
      })}
      {posts.next_page ? (
        <button type="button" onClick={morePosts} className={styles.morePosts}>
          Carregar mais posts
        </button>
      ) : null}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        }),
      },
    },
  };
};
