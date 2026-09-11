// ПЗ4: демонстрация prop drilling (userName идёт через уровни, которым он не нужен)
function UserAvatar({ userName }) {
  return <span className="pz24-avatar">👤 {userName}</span>;
}

function UserMenu({ userName }) {
  // userName здесь не используется — только прокидывается дальше
  return (
    <div className="pz24-drill-box">
      <small>UserMenu (props транзитом)</small>
      <UserAvatar userName={userName} />
    </div>
  );
}

function Navigation({ userName }) {
  return (
    <div className="pz24-drill-box">
      <small>Navigation (props транзитом)</small>
      <UserMenu userName={userName} />
    </div>
  );
}

function Header({ userName }) {
  return (
    <div className="pz24-drill-box">
      <small>Header (props транзитом)</small>
      <Navigation userName={userName} />
    </div>
  );
}

export default function PropDrillingDemo() {
  const userName = 'facilitator@agile.local';
  return (
    <section className="pz24-drill">
      <h2>ПЗ4: prop drilling</h2>
      <p>
        Цепочка App → Header → Navigation → UserMenu → UserAvatar. Имя пользователя нужно только
        аватарке, но передаётся через все уровни.
      </p>
      <Header userName={userName} />
    </section>
  );
}
