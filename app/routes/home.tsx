import styled from 'styled-components';

const HomeContainer = styled.div`
  padding: 20px;
`;

function Home() {
  return (
    <HomeContainer>
      <h1>Welcome to Grok SF</h1>
      <p>Use the Generator to create supplement panels or manage your ingredients.</p>
    </HomeContainer>
  );
}

export default Home;