import test from 'ava';

import { getFnCbProxy } from './get-proxy';

interface User {
  name: string;
}

class UserManager {
  constructor(public users: User[] = []) {}

  getUsers = (): User[] => this.users;

  addUser = async (cmd: User): Promise<User[]> => {
    this.users.push(cmd);
    return this.users;
  };

  logUsers = () => console.log('LOGGING USERS: ', this.users);

  userCausesError = () => {
    throw new Error('A user has caused an error. Of course...');
  };

  userCausesErrorAsync = async () => {
    throw new Error('A user has caused an ASYNC error. Of course...');
  };

  userCausesLateErrorAsync = async () => {
    // NOTE: if using api like setTimeout, have to return a new promise or else false success will register
    // NOTE: the following 3 LOC cause a false success, dont do this!
    // setTimeout(() => {
    //   throw new Error('A user has caused a LATE ASYNC error. Of course...');
    // }, 1500);

    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('A user has caused a LATE ASYNC error. Of course...'));
      }, 1500);
    });
  };
}

const userManager: UserManager = new UserManager();
const proxy = getFnCbProxy<UserManager>({
  target: userManager,
  onSuccess: (cmd) => {
    console.log('ON SUCCESS', { cmd });
  },
  onAfter: (cmd) => {
    console.log('ON AFTER', { cmd });
  },
  onBefore: (cmd) => {
    if (cmd.prop === 'getUsers') {
      console.log('ON BEFORE SYNC', { cmd });
      return;
    }

    return new Promise((res) => {
      setTimeout(() => {
        console.log('ON BEFORE ASYNC', { cmd });
        res(undefined);
      }, 2500);
    });
  },
  onError: (cmd) => {
    console.log('ON ERROR', { cmd });
  },
});

test('get-proxy', async (t) => {
  // console.log('USERS = ', proxy.users);
  // console.log('GET USERS = ', proxy.getUsers());
  // console.log('ADD USER = ', await proxy.addUser({ name: 'cri' }));
  // console.log(proxy.logUsers());

  // t.throws(
  //   () => {
  //     proxy.userCausesError();
  //   },
  //   { instanceOf: Error, message: 'A user has caused an error. Of course...' }
  // );

  // await t.throwsAsync(
  //   async () => {
  //     await proxy.userCausesErrorAsync();
  //   },
  //   {
  //     instanceOf: Error,
  //     message: 'A user has caused an ASYNC error. Of course...',
  //   }
  // );

  // await t.throwsAsync(
  //   async () => {
  //     await proxy.userCausesLateErrorAsync();
  //   },
  //   {
  //     instanceOf: Error,
  //     message: 'A user has caused a LATE ASYNC error. Of course...',
  //   }
  // );
  t.pass();
});

test('async-fn', async (t) => {
  try {
    await proxy.userCausesLateErrorAsync();
  } catch (error) {
    console.error('error', error);
  }

  t.pass();
});
