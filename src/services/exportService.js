import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export class ExportService {
  // Export to CSV
  exportToCSV(data, filename = 'export.csv') {
    try {
      // Validate data
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Invalid data for CSV export:', data)
        return
      }

      // Check if first item is a valid object
      if (!data[0] || typeof data[0] !== 'object') {
        console.error('Data items must be objects:', data[0])
        return
      }

      // Get headers from first item
      const headers = Object.keys(data[0])
      if (headers.length === 0) {
        console.error('No headers found in data')
        return
      }
      
      // Create CSV content with proper escaping
      let csvContent = headers.map(header => this.escapeCSVField(header)).join(',') + '\n'
      
      data.forEach(row => {
        if (row && typeof row === 'object') {
          const values = headers.map(header => {
            const value = row[header]
            return this.escapeCSVField(value)
          })
          csvContent += values.join(',') + '\n'
        }
      })

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up URL object
        setTimeout(() => URL.revokeObjectURL(url), 100)
        
        console.log('CSV export successful:', filename)
      } else {
        console.error('Download not supported in this browser')
      }
    } catch (error) {
      console.error('CSV export error:', error)
    }
  }

  // Helper method to properly escape CSV fields
  escapeCSVField(field) {
    if (field === null || field === undefined) {
      return ''
    }
    
    const stringField = String(field)
    
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
      return '"' + stringField.replace(/"/g, '""') + '"'
    }
    
    return stringField
  }

  // Export to PDF
  exportToPDF(data, filename = 'export.pdf', title = 'Data Export') {
    try {
      // Validate data
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('Invalid data for PDF export:', data)
        return
      }

      // Check if first item is a valid object
      if (!data[0] || typeof data[0] !== 'object') {
        console.error('Data items must be objects:', data[0])
        return
      }

      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(18)
      doc.text(title, 14, 22)
      
      // Get headers
      const headers = Object.keys(data[0])
      if (headers.length === 0) {
        console.error('No headers found in data')
        return
      }
      
      // Prepare table data
      const tableData = data.map(row => 
        headers.map(header => {
          const value = row[header]
          return value !== null && value !== undefined ? String(value) : ''
        })
      )

      // Create table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      })

      // Save file
      doc.save(filename)
      console.log('PDF export successful:', filename)
    } catch (error) {
      console.error('PDF export error:', error)
    }
  }

  // Export scam articles data
  exportScamsData(scams, format = 'csv') {
    if (format === 'csv') {
      this.exportToCSV(scams, 'scam-articles.csv')
    } else if (format === 'pdf') {
      this.exportToPDF(scams, 'scam-articles.pdf', 'Scam Prevention Articles Data')
    }
  }

  // Export user data
  exportUsersData(users, format = 'csv') {
    if (format === 'csv') {
      this.exportToCSV(users, 'users.csv')
    } else if (format === 'pdf') {
      this.exportToPDF(users, 'users.pdf', 'User Data')
    }
  }
}

export default new ExportService() 