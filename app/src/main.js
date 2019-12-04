/**
 * KYIV MEDIA
 * 04.12.2019
 */
import React, {useState} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView} from 'react-native';
import {Query, Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import uuid from 'uuid/v1';

export default function Main() {
  return (
    <View style={StyleSheet.container}>
      <TextBox />
      <List />
    </View>
  );
}

const insertTodo = gql`
  mutation($task: String, $id: uuid) {
    insert_tasks(objects: {task: $task, user_id: 1, id: $id}) {
      returning {
        id
        task
      }
    }
  }
`;

const TextBox = () => {
  const [text, setText] = useState('');
  const handleTextChange = text => setText(text);
  const generatedUUID = uuid();

  return (
    <Mutation
      mutation={insertTodo}
      variables={{task: text, id: generatedUUID}}
      update={(cache, {data: {insert_tasks}}) => {
        const existingTasks = cache.readQuery({
          query: fetchMyTasks,
        }).tasks;
        const newTasks = [insert_tasks.returning[0], ...existingTasks];
        cache.writeQuery({
          query: fetchMyTasks,
          data: {tasks: newTasks},
        });
      }}
      optimisticResponse={{
        __typename: 'mutation_root',
        insert_tasks: {
          __typename: 'tasks_mutation_response',
          returning: [
            {
              __typename: 'tasks',
              id: generatedUUID,
              task: text,
              user_id: 1,
            },
          ],
        },
      }}>
      {mutate => {
        const submit = () => {
          mutate();
          setText('');
        };
        return (
          <TextInput
            placeholder="Please enter the name of Task"
            value={text}
            onChangeText={handleTextChange}
            style={styles.sTextbox}
            onSubmitEditing={submit}
          />
        );
      }}
    </Mutation>
  );
};

const fetchMyTasks = gql`
  query {
    tasks {
      id
      task
    }
  }
`;

const List = () => {
  //   const data = {
  //     tasks: [
  //       {
  //         id: 'num1',
  //         task: 'Simple Task 1',
  //       },
  //       {
  //         id: 'num2',
  //         task: 'Simple Task 2',
  //       },
  //       {
  //         id: 'num3',
  //         task: 'Simple Task 3',
  //       },
  //     ],
  //   };
  return (
    <Query query={fetchMyTasks}>
      {({data, error, loading}) => {
        if (error) {
          console.error(error);
          return <Text>Error</Text>;
        }
        if (loading) {
          return <Text>Loading...</Text>;
        }

        return (
          <ScrollView>
            {data.tasks.map(t => {
              return (
                <View style={styles.sTaskItem} key={t.id}>
                  <Text style={styles.sText}>{t.task}</Text>
                </View>
              );
            })}
          </ScrollView>
        );
      }}
    </Query>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 20,
    padding: 10,
  },
  sTextbox: {
    backgroundColor: 'yellow',
    width: 400,
    height: 50,
    padding: 5,
    borderRadius: 5,
    fontSize: 20,
    marginBottom: 10,
  },
  sTaskItem: {
    padding: 5,
    marginBottom: 10,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    backgroundColor: 'lightgrey',
  },
  sText: {
    color: 'white',
  },
});
