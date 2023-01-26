import React from 'react';
import AppLayout from '../components/AppLayoutProps';

type AppProps = {
  Component: React.ElementType;
};

function MyApp({ Component }: AppProps) {
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

export default MyApp;
