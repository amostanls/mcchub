import Button from "@/components/Button";
import Dashboard from "@/components/Dashboard";
import TextInput from "@/components/FormComponents/TextInput";
import { db } from "@/firebase";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

const UserCard = ({
  userId,
  users,
  nricData,
  role,
  managedStudents,
  payments,
  searchKey,
}: {
  userId: string;
  users: any;
  nricData: any;
  role: string;
  managedStudents: any;
  payments: any;
  searchKey: string;
}) => {
  let hidden = false;
  let keys = searchKey
    .trim()
    .split(" ")
    .map((x) => x.toLowerCase().trim())
    .filter((x) => x.length > 0);

  if (searchKey) {
    hidden = true;
    for (let k of keys) {
      if (userId.toLowerCase().includes(k)) hidden = false;
    }
    for (let k of keys) {
      if (role.toLowerCase().includes(k)) hidden = false;
    }
    for (let key of Object.keys(users[userId])) {
      if (!hidden) break;
      for (let k of keys) {
        if (users[userId][key].toLowerCase().includes(k)) {
          hidden = false;
          break;
        }
      }
    }
  }

  return (
    <div
      className={
        "rounded-lg overflow-hidden shadow-lg p-4 mb-4" +
        (hidden ? " hidden" : "")
      }
    >
      <div className="font-bold text-xl mb-2">
        {users[userId]?.name}: {users[userId].email}
      </div>
      <div className="text-gray-700 text-base mb-2">
        <div className="flex flex-col">
          <div>uid: {userId}</div>
          <div>role: {role}</div>
          {Object.keys(users[userId])
            .filter((key) => !["email", "name", "nric"].includes(key))
            .map((key) => (
              <div key={key}>
                {key}: {users[userId][key]}
              </div>
            ))}

          {/* payments */}
          {role == "teacher" || role == "parent" ? (
            <div>
              <div className="font-bold">
                Payments: {payments ? Object.keys(payments).length : null}{" "}
                (Approved:{" "}
                {payments
                  ? Object.keys(payments).filter(
                      (key) => payments[key]?.approved?.status == "approved"
                    ).length
                  : null}
                , Pending:{" "}
                {payments
                  ? Object.keys(payments).filter(
                      (key) =>
                        !payments[key]?.approved?.status ||
                        payments[key]?.approved?.status == "pending"
                    ).length
                  : null}
                , Rejected:{" "}
                {payments
                  ? Object.keys(payments).filter(
                      (key) => payments[key]?.approved?.status == "rejected"
                    ).length
                  : null}
                )
              </div>
            </div>
          ) : null}

          {/* students */}
          {role == "teacher" || role == "parent" ? (
            <div>
              <div className="font-bold">
                Students: {Object.keys(managedStudents).length}
              </div>
              <div className="flex flex-col">
                {Object.keys(managedStudents).map((studentId) => (
                  <div
                    key={studentId}
                    className={
                      nricData[studentId]?.student
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {studentId}{" "}
                    {nricData[studentId]?.student ? (
                      <span>({users[nricData[studentId].student].email})</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* teacher of student */}
          {role == "student" && users[userId]?.nric ? (
            <div>
              <div className="font-bold">
                NRIC/Passport Number:{" "}
                <span
                  className={
                    nricData[users[userId]!.nric]?.manager
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {users[userId]!.nric}{" "}
                  {nricData[users[userId]!.nric]?.manager
                    ? `(manager: ${users[nricData[users[userId]!.nric]!.manager].email})`
                    : null}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap">
        <Button className="mx-2 my-1">Edit User</Button>
        {role == "teacher" || role == "parent" ? (
          <Button className="mx-2 my-1">View Payments</Button>
        ) : null}
      </div>
    </div>
  );
};

export default function App() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const [users, setUsers] = useState<any>({});
  const [roles, setRoles] = useState<any>({});
  const [nricData, setNricData] = useState<any>({});
  const [managedStudents, setManagedStudents] = useState<any>({});
  const [payments, setPayments] = useState<any>({});

  function fetchUsers() {
    if (loaded) return;
    setLoaded(true);

    onValue(ref(db, "users"), (snapshot) => {
      const data = snapshot.val();
      console.log("users", data);
      setUsers(snapshot.val() || {});
    });

    onValue(ref(db, "nric"), (snapshot) => {
      const data = snapshot.val();
      console.log("nric", data);
      setNricData(snapshot.val() || {});
    });

    onValue(ref(db, "role"), (snapshot) => {
      const data = snapshot.val();
      console.log("role", data);
      setRoles(snapshot.val() || {});
    });

    onValue(ref(db, "managedStudents"), (snapshot) => {
      const data = snapshot.val();
      console.log("managedStudents", data);
      setManagedStudents(snapshot.val() || {});
    });

    onValue(ref(db, "payments"), (snapshot) => {
      const data = snapshot.val();
      console.log("payments", data);
      setPayments(snapshot.val() || {});
    });
  }

  useEffect(() => {
    console.log(search);
  });

  return (
    <Dashboard>
      <div className="place-content-center w-full">
        <Button
          className={"mx-auto" + (loaded ? " hidden" : "")}
          onClick={() => fetchUsers()}
        >
          Fetch All Users
        </Button>
        <div hidden={!loaded}>
          <div className="text-gray-500 text-center">
            <div hidden={Object.keys(users).length > 0}>Loading Users Data</div>
            <div hidden={Object.keys(nricData).length > 0}>
              Loading NRIC Data
            </div>
          </div>
          <TextInput
            placeholder="Search"
            inputName={null}
            props={{
              onChange: (e: any) => {
                setSearch(e.target.value);
              },
            }}
          />
          <div className="flex flex-col">
            {Object.keys(users).map((id: string) => (
              <UserCard
                key={id}
                userId={id}
                users={users}
                nricData={nricData}
                role={roles[id]}
                managedStudents={managedStudents[id]}
                payments={payments[id]}
                searchKey={search}
              />
            ))}
          </div>
        </div>
      </div>
    </Dashboard>
  );
}