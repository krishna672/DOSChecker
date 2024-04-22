import socket
import sys
import time

def check_ports(ip, ports):
    try:
        while True:
            for port in ports:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex((ip, port))
                current_time = time.strftime('%Y-%m-%d %H:%M:%S')

                if result == 0:
                    try:
                        service_name = socket.getservbyport(port)
                    except OSError:
                        service_name = "Unknown"
                    print(f"[{current_time}] Port {port} on {ip} is open, Service: {service_name}")
                    sys.stdout.flush()
                else:
                    print(f"[{current_time}] Port {port} on {ip} is closed")
                    sys.stdout.flush()
                sock.close()
                time.sleep(1)
    except KeyboardInterrupt:
        print("Program terminated by user.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python backend.py <IP> <Port1> [<Port2> <Port3> ...]")
        sys.exit(1)

    ip = sys.argv[1]
    ports = [int(port) for port in sys.argv[2:]]
    check_ports(ip, ports)
