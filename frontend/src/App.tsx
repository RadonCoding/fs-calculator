import styles from "./App.module.css";
import Calculator from "./Calculator";

function App() {
  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <Calculator />
      </main>
    </div>
  );
}

export default App;
