/**
 * KYIV MEDIA
 * 04.12.2019
 */
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  AsyncStorage,
} from 'react-native';

import {
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Main from './app/src/main';
import {concat} from 'apollo-link';
import {RetryLink} from 'apollo-link-retry';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';
import {ApolloProvider} from 'react-apollo';
import {persistCache} from 'apollo-cache-persist';

const App = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const httplink = new HttpLink({
      uri: 'https://graphql-offlineapp.herokuapp.com/v1/graphql',
    });

    const retryLink = new RetryLink({attempts: {max: Infinity}});

    const link = concat(retryLink, httplink);

    const cache = new InMemoryCache();

    persistCache({
      cache,
      storage: AsyncStorage,
    }).then(() => {
      const client = new ApolloClient({link, cache});
      setClient(client);
    });
  }, []);

  if (!client) {
    return (
      <View style={styles.sContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ApolloProvider client={client}>
      <Main />
    </ApolloProvider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
