# Product Requirement Document (PRD)

###  #Document Search Application for Dropbox

### **Overview**

The Document Search Application enables users to search and retrieve files stored in Dropbox by indexing the content within the files. The application supports files in various formats such as `.txt`, `.pdf`, and `.docx` and provides a seamless search experience with filtering and sorting options.

---

### **Objectives**

1. Provide a robust search service for files stored in Dropbox.
2. Support full-text search capabilities across multiple file formats.
3. Deliver a user-friendly web interface for search and result management.

---

### **Target Audience**

This product is aimed at individuals and organizations that require efficient search capabilities for documents stored in Dropbox.

---

### **Features**

#### **Core Features**

1. **Integration with Dropbox**

   - Use Dropbox API to fetch and manage files stored in the user’s Dropbox account.

2. **Full-Text Search**

   - Index file content for `.txt`, `.pdf`, and `.docx` files.
   - Search based on content within files.

3. **Search API**

   - Provide an API endpoint to perform search queries, returning matching files and their Dropbox URLs.
   - Example: `GET /search?q="search-term"`.

4. **Web Interface**

   - Allow users to search for documents via a clean and intuitive web UI.
   - Display search results with metadata (file name, last modified date, etc.).

#### **Additional Features (Optional)**

1. **Filtering Options**

   - Filter results by last modified date, and relavance.

2. **Sorting**

   - Allow sorting of search results by relevance, or date modified

---

### **Technical Requirements**

#### **Backend**

- **Language/Framework:** Next.js with Trigger.dev for background processing
- **Search Engine:** Elasticsearch for document indexing and search
- **Document Access:**: Dropbox API v2 for accessing file metadata and content
- **File Parsing:** Apache Tika for text extraction from `.pdf` and `.docx` files

#### **Frontend**

- **Framework:** Next.js/React
- **UI Components:**
  - Shadcn UI component library
  - TanStack React Query for data fetching & caching
  - Tailwind CSS for styling
- **Design:** Responsive design with filtering and sorting controls

#### **Infrastructure & Deployment**

- **Infrastructure as Code:** Terraform
- **Cloud Platform:** AWS
  - ECS on Fargate for container orchestration
  - Application Load Balancer for traffic routing
  - Default VPC with public subnets
- **Services:**
  - Elasticsearch service
  - Apache Tika service

---

### **APIs**

1. **Search Files:**

   - Endpoint: `GET /search?q=<query>`
   - Description: Perform full-text search and return matching files with metadata.

---

### **Risks and Assumptions**

1. Dropbox API rate limits may impact performance for large-scale use.
2. Extracting content from some file formats might require additional configurations or tools.
3. Users’ files must remain secure, requiring adherence to data privacy regulations.
