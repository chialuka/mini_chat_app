import React, { useCallback } from "react";

const User = props => {
  const { users, email, name } = props;

  const selectUser = useCallback((mail, user) => {
    props.selectedMail(mail, user);
  });

  const deleteUser = useCallback(() => {
    props.deleteUser(email);
  });

  return (
    <div className="userWelcome">
      <div className="leave" onClick={deleteUser}>
        Leave Chat?
      </div>
      <p>Hello, {name}</p>
      <div className="selectUser">
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
