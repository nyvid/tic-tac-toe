import Link from 'next/link';

const Index = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Link href="/game">
        <button>Play now</button>
      </Link>
    </div>
  );
};

export default Index;
