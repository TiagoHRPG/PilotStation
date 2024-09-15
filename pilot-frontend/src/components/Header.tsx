interface HeaderProps {
    connectionString: string;
    setConnectionString: (value: string) => void;
    handleConnectClick: () => Promise<void>;
  }

const Header: React.FC<HeaderProps> = ({ connectionString, setConnectionString, handleConnectClick }) => {
    return (
        <div className="header">
        <button onClick={handleConnectClick}>Connect</button>
        <input
            type="text"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="Enter connection string"
        />
        </div>
    );
};

export default Header;

