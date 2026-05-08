import NavBar from '@/components/Navbar';
import Services from '@/components/services';
import Artists from '@/components/artists';
import '@/styles/reference.css';

function Reference() {
  return (
    <>
      <NavBar />
      <main className='reference-page'>
        <h1 className='reference-title'>Reference</h1>
        <Services />
        <Artists />
      </main>
    </>
  );
}

export default Reference;
