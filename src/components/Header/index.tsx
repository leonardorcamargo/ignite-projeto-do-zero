/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header() {
  const router = useRouter();
  return (
    <header className={styles.headerContainer}>
      <a href="/">
        <Image
          width={239}
          height={27}
          src="/logo.svg"
          alt="logo"
          onClick={() => router.push('/', 'Home', {})}
        />
      </a>
    </header>
  );
}
