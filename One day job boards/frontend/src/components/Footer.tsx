function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8">

        <div>
          <h2 className="text-white text-lg font-semibold mb-4">About Us</h2>
          <p className="mb-4">
            The One-Day Job Board is a CUET-focused platform that connects students who need 
            quick help with peers willing to complete short tasks. Our mission is to make 
            campus collaboration easier, faster, and more reliable.
          </p>
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Quick Links</h2>
          <ul>
            <li><a href="#" className="hover:text-white transition-colors duration-300">Home</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-300">Browse Jobs</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-300">Post a Job</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-300">My Applications</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors duration-300">Facebook</a>
            <a href="#" className="hover:text-white transition-colors duration-300">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Instagram</a>
          </div>
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Contact Us</h2>
          <p>CUET, Chittagong</p>
          <p>Bangladesh</p>
          <p>Email: support@onedayjobs.cuet</p>
          <p>Phone: +880 1XXX-XXXXXX</p>
        </div>

      </div>

      <p className="text-center text-xs pt-8">
        © 2025 The One-Day Job Board. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
