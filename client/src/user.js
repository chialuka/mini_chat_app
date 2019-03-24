import React, { useCallback } from "react";

const User = props => {
  const { users, email, name } = props;

  const selectUser = useCallback((mail, user) => {
    props.selectedMail(mail, user);
  }, [mail, user]);

  const deleteUser = useCallback(() => {
    props.deleteUser(email);
  }, [email]);

  return (
    <div className="user-welcome">
      <div className="leave" onClick={deleteUser}>
        Leave Chat?
      </div>
      <p>Hello, {name}</p>
      <div className="select-user">
        {users.map(item =>
          item.email !== email ? (
            <div
              key={item.id}
              className="users"
              onClick={() => selectUser(item.email, item.name)}
            >
              {item.name}
            </div>
          ) : (
            ""
          )
        )}
      </div>
    </div>
  );
};

export default User;
