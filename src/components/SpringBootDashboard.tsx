import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, Terminal, HelpCircle, HardDrive, Cpu, Database, 
  Sparkles, Code, Play, CheckCircle2, ChevronRight, Copy, Check, MessageSquare
} from 'lucide-react';

// Hardcoded string templates mirroring the physical backend files exactly
const SPRING_BOOT_TEMPLATES: Record<string, { path: string; ext: string; content: string }> = {
  'pom.xml': {
    path: '/springboot-backend/pom.xml',
    ext: 'xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>
    <groupId>io.uvicorn</groupId>
    <artifactId>marketplace-backend</artifactId>
    <version>1.0.0</version>
    <name>Uvicorn Express Backend</name>
    <description>Enterprise Java Spring Boot microservice for the Uvicorn Marketplace</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>`
  },
  'application.yml': {
    path: '/springboot-backend/src/main/resources/application.yml',
    ext: 'yaml',
    content: `server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: uvicorn-marketplace-service
  datasource:
    url: jdbc:h2:mem:uvicorndb;DB_CLOSE_DELAY=-1
    driverClassName: org.h2.Driver
    username: sa
    password: password
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
    show-sql: true`
  },
  'MarketplaceApplication.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/MarketplaceApplication.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace;

import io.uvicorn.marketplace.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class MarketplaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketplaceApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}`
  },
  'Product.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/model/Product.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;
    private Double originalPrice;
    private Double discountPercentage;
    private Double rating;
    private Integer reviewCount;
    private String image;
    private Boolean isBestSeller = false;
    private Boolean isPrime = true;
    private Integer stock = 10;
}`
  },
  'Order.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/model/Order.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_orders")
@Data
@NoArgsConstructor
public class Order {
    @Id
    private String id;
    private String date;
    private Double totalAmount;
    private Double totalSavings;
    private String paymentMethod;
    private String upiHandle;

    @Embedded
    private ShippingDetails shippingDetails;
    private String status = "placed";
    private Integer currentTrackingStep = 1;
    
    @Column(columnDefinition = "TEXT")
    private String serializedItems;
}`
  },
  'ProductRepository.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/repository/ProductRepository.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace.repository;

import io.uvicorn.marketplace.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryIgnoreCase(String category);
    List<Product> findByTitleContainingIgnoreCase(String searchWord);
    List<Product> findByIsBestSellerTrue();
}`
  },
  'OrderRepository.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/repository/OrderRepository.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace.repository;

import io.uvicorn.marketplace.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findAllByOrderByDateDesc();
}`
  },
  'ProductController.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/controller/ProductController.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace.controller;

import io.uvicorn.marketplace.model.Product;
import io.uvicorn.marketplace.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        if (category != null && !category.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(productRepository.findByCategoryIgnoreCase(category));
        }
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productRepository.findByTitleContainingIgnoreCase(search));
        }
        return ResponseEntity.ok(productRepository.findAll());
    }
}`
  },
  'OrderController.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/controller/OrderController.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace.controller;

import io.uvicorn.marketplace.model.Order;
import io.uvicorn.marketplace.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        Order saved = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}`
  },
  'GlobalExceptionHandler.java': {
    path: '/springboot-backend/src/main/java/io/uvicorn/marketplace/exception/GlobalExceptionHandler.java',
    ext: 'java',
    content: `package io.uvicorn.marketplace.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("error", "Internal Server Error");
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}`
  }
};

const INITIAL_LOGS = [
  "  .   ____          _            __ _ _",
  " /\\\\ / ___'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\",
  "( ( )\\___ | '_ | '_| | '_ \\/ _` | \\ \\ \\ \\",
  " \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )",
  "  '  |____| .__|_| |_|_| |_|\\__, | / / / /",
  " =========|_|==============|___/=/_/_/_/",
  " :: Spring Boot ::                v3.2.5",
  "",
  "2026-05-24 19:32:01.405 INFO  [main] i.u.m.MarketplaceApplication : Starting MarketplaceApplication with JVM OpenJDK 17.0.8",
  "2026-05-24 19:32:01.415 INFO  [main] i.u.m.MarketplaceApplication : No active profile set, falling back to default profiles: default",
  "2026-05-24 19:32:02.134 INFO  [main] o.s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.",
  "2026-05-24 19:32:02.190 INFO  [main] o.s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 56 ms. Found 2 JPA repositories.",
  "2026-05-24 19:32:02.940 INFO  [main] o.s.b.w.e.t.TomcatWebServer : Tomcat initialized with port(s): 8080 (http)",
  "2026-05-24 19:32:03.011 INFO  [main] o.a.c.c.StandardService : Starting service [Tomcat]",
  "2026-05-24 19:32:03.012 INFO  [main] o.a.c.c.StandardEngine : Starting Servlet engine: [Apache Tomcat/10.1.20]",
  "2026-05-24 19:32:03.490 INFO  [main] o.h.e.t.j.p.i.PersistenceUnitInfoDescriptor : HHH000204: Processing PersistenceUnitInfo [name: default]",
  "2026-05-24 19:32:03.712 INFO  [main] o.h.Version : HHH000412: Hibernate ORM core version 6.4.4.Final",
  "2026-05-24 19:32:04.095 INFO  [main] o.h.c.i.RegionFactoryInitiator : HHH000291: Java second level cache disabled",
  "2026-05-24 19:32:04.225 INFO  [main] com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Starting...",
  "2026-05-24 19:32:04.450 INFO  [main] com.zaxxer.hikari.pool.HikariPool : HikariPool-1 - Added connection conn0: url=jdbc:h2:mem:uvicorndb user=sa",
  "2026-05-24 19:32:04.452 INFO  [main] com.zaxxer.hikari.HikariDataSource : HikariPool-1 - Start completed.",
  "2026-05-24 19:32:04.512 INFO  [main] o.h.d.Dialect : HHH000400: Using dialect: org.hibernate.dialect.H2Dialect",
  "2026-05-24 19:32:05.105 INFO  [main] o.h.t.s.i.SchemaCreatorImpl : HHH000476: Creating database schema 'uvicorndb' in auto ddl-auto mode: update",
  "2026-05-24 19:32:05.811 INFO  [main] o.s.b.a.h2.H2ConsoleAutoConfiguration : H2 console available at '/api/h2-console'. Database available at 'jdbc:h2:mem:uvicorndb'",
  "2026-05-24 19:32:06.012 INFO  [main] o.s.b.w.e.t.TomcatWebServer : Tomcat started on port(s): 8080 (http) with context path '/api'",
  "2026-05-24 19:32:06.115 INFO  [main] i.u.m.MarketplaceApplication : Seeding initial database tables with Uvicorn premium product listings...",
  "2026-05-24 19:32:06.210 INFO  [main] i.u.m.MarketplaceApplication : Saved Product Code 12: Titanium SoundWave ANC Waterproof Earbuds",
  "2026-05-24 19:32:06.215 INFO  [main] i.u.m.MarketplaceApplication : Saved Product Code 13: Projector Nebula Core Ultra-HD Portable Cinema",
  "2026-05-24 19:32:06.220 INFO  [main] i.u.m.MarketplaceApplication : Saved Product Code 15: Urban Minimalist Heavy-Duty Waterproof Backpack",
  "2026-05-24 19:32:06.230 INFO  [main] i.u.m.MarketplaceApplication : Spring Boot Context fully prepared with 18 indexed product entities.",
  "2026-05-24 19:32:06.242 INFO  [main] i.u.m.MarketplaceApplication : Started MarketplaceApplication in 5.347 seconds (process running time: 6.12)"
];

export function SpringBootDashboard() {
  const [selectedFile, setSelectedFile] = useState<string>('MarketplaceApplication.java');
  const [copied, setCopied] = useState<boolean>(false);
  
  // Custom generated tab if AI architect modifies something
  const [aiCustomFiles, setAiCustomFiles] = useState<Record<string, string>>({});
  const [selectedCustomFile, setSelectedCustomFile] = useState<string | null>(null);

  // AI Architect controls
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>('CustomController.java');

  // Logs tracking state
  const [logsList, setLogsList] = useState<string[]>(INITIAL_LOGS);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);

  // Stats
  const [memPercent, setMemPercent] = useState<number>(44);
  const [activeThreads, setActiveThreads] = useState<number>(8);
  const [dbConnections, setDbConnections] = useState<number>(3);
  const [requestsCount, setRequestsCount] = useState<number>(142);

  // Read code content
  const activeFileConfig = SPRING_BOOT_TEMPLATES[selectedFile];
  const fileContentToDisplay = selectedCustomFile && aiCustomFiles[selectedCustomFile]
    ? aiCustomFiles[selectedCustomFile]
    : (activeFileConfig ? activeFileConfig.content : '// Empty file');

  const handlerPath = selectedCustomFile 
    ? `/src/main/java/io/uvicorn/marketplace/generated/${selectedCustomFile}`
    : (activeFileConfig ? activeFileConfig.path : '');

  // Subscribe to real-time events from shopping interactions via custom events
  useEffect(() => {
    const handleLogEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: 'INFO' | 'DEBUG' | 'WARN';
        logger: string;
        message: string;
      }>;
      
      if (customEvent.detail) {
        const { type, logger, message } = customEvent.detail;
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
        const newLog = `${timeStr} ${type.padEnd(5, ' ')} [nio-8080-exec-${Math.floor(Math.random() * 8) + 1}] i.u.m.${logger.padEnd(25, ' ')} : ${message}`;
        
        setLogsList(prev => [...prev, newLog]);
        setRequestsCount(r => r + 1);
        setActiveThreads(t => Math.min(24, Math.max(4, t + (Math.random() < 0.5 ? 1 : -1))));
        setDbConnections(d => Math.min(10, Math.max(1, d + (Math.random() < 0.3 ? 1 : Math.random() < 0.3 ? -1 : 0))));
      }
    };

    window.addEventListener('springboot_log', handleLogEvent);
    return () => window.removeEventListener('springboot_log', handleLogEvent);
  }, []);

  // Set up random micro-fluctuations in JVM metrics to make it feel beautifully "alive"
  useEffect(() => {
    const timer = setInterval(() => {
      setMemPercent(m => {
        const delta = (Math.random() - 0.5) * 1.5;
        const next = m + delta;
        return Math.min(95, Math.max(15, parseFloat(next.toFixed(1))));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Autoscroll terminal
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logsList]);

  // Copy Code
  const handleCopy = () => {
    navigator.clipboard.writeText(fileContentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit requests to the actual server-side Gemini architect endpoint
  const handleGenerateCustomComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setAiError(null);
    setAiNotes(null);

    // Seed the logs showing the LLM call starting
    const now = new Date().toLocaleTimeString();
    const triggerLog = `[SYSTEM-AI] ${now} - Prompting Gemini server-side architect proxy matching criteria: "${prompt}"`;
    setLogsList(prev => [...prev, triggerLog]);

    try {
      const response = await fetch('/api/architect/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: newFileName,
          code: fileContentToDisplay,
          instructions: prompt,
          language: 'java'
        })
      });

      if (!response.ok) {
        throw new Error(`Architect server returned status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add the file to custom templates
      setAiCustomFiles(prev => ({
        ...prev,
        [newFileName]: data.code
      }));
      setSelectedCustomFile(newFileName);
      setAiNotes(data.feedback);
      
      // Update logs with AI verification
      setLogsList(prev => [
        ...prev,
        `2026-05-24 19:34:00.112 INFO  [nio-8080-exec-9] i.u.m.a.GeminiArchitect : Compiled successfully custom Spring artifact into dynamic ClassLoader.`,
        `[SYSTEM-AI] Registered: ${newFileName} into virtual hot-swap. Refreshing view.`
      ]);

      setPrompt('');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error occurred communicating with the server AI module.');
      setLogsList(prev => [
        ...prev,
        `[SYSTEM-ERROR] Failed to compile dynamically generated model parameters: ${err.message}`
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearLogsConsole = () => {
    setLogsList(["[SYSTEM] Logs console buffered logs flushed manually in sandbox admin context."]);
  };

  return (
    <div id="springboot-dashboard-viewport" className="space-y-6">
      
      {/* 1. TOP HEADER SUMMARY GRID BAR */}
      <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl text-left shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                Java Spring Boot JVM Console
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                  ● PORT: 8080 (MOCK CO-ENG)
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              We've created a complete Spring Boot 3.x JPA/Hibernate microservice in your workspace directory <code className="bg-slate-800 text-slate-300 font-mono px-1 rounded">/springboot-backend</code>. 
              Review the enterprise codebase below, query Gemini to hot-swap classes, and observe real-time database query logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800 self-start md:self-auto uppercase tracking-widest text-[9px] font-mono text-slate-450 text-slate-400">
            <span>Maven: SUCCESS</span>
            <span className="text-slate-700 font-bold">|</span>
            <span>H2 Database: Connected</span>
            <span className="text-slate-700 font-bold">|</span>
            <span>CORS: Allowed</span>
          </div>
        </div>

        {/* Live Hardware & SQL Stats Board */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
              <Cpu className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">JVM Heap Allocation</div>
              <div className="text-sm font-black text-white font-mono">{memPercent}% <span className="text-[9px] text-slate-500 font-normal">of 1024MB</span></div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                <div style={{ width: `${memPercent}%` }} className="bg-indigo-500 h-full transition-all duration-1000" />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
              <Terminal className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Simulated Request Threads</div>
              <div className="text-sm font-black text-white font-mono">{activeThreads} <span className="text-[9px] text-slate-500 font-normal">Active pool</span></div>
              <div className="text-[9px] text-emerald-400 font-mono">io-thread-scheduler-ready</div>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-center gap-3">
            <span className="p-2 bg-teal-500/10 text-teal-400 rounded-lg shrink-0">
              <Database className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">H2 Hikari Connections</div>
              <div className="text-sm font-black text-white font-mono">{dbConnections} <span className="text-[9px] text-slate-500 font-normal">/ 10 max</span></div>
              <div className="text-[9px] text-teal-400 font-mono">jdbc:h2:mem:uvicorndb</div>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-center gap-3">
            <span className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Intercepted JPA Requests</div>
              <div className="text-sm font-black text-white font-mono">{requestsCount} <span className="text-[9px] text-slate-500 font-normal">Queries</span></div>
              <div className="text-[9px] text-pink-400 font-mono">REST response rate: 14ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DUAL INTERACTIVE WORKSPACE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: JAVA FILE EXPLORER & CODE PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[650px] text-left">
          
          {/* File Tab Header ribbon */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-extrabold flex items-center gap-1">
                <FileCode className="w-4 h-4 text-slate-600" />
                JAVA CODE EXPLORER:
              </span>
              <div className="flex items-center space-x-1.5 pl-2 overflow-x-auto scrollbar-none">
                {Object.keys(SPRING_BOOT_TEMPLATES).map(fileName => {
                  const isActive = selectedFile === fileName && !selectedCustomFile;
                  return (
                    <button
                      key={fileName}
                      onClick={() => { setSelectedFile(fileName); setSelectedCustomFile(null); }}
                      className={`text-[11px] font-mono font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {fileName}
                    </button>
                  );
                })}

                {/* Show custom AI generated files as dynamic tabs */}
                {Object.keys(aiCustomFiles).map(fileName => {
                  const isActive = selectedCustomFile === fileName;
                  return (
                    <button
                      key={fileName}
                      onClick={() => setSelectedCustomFile(fileName)}
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border text-emerald-800 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm font-black' 
                          : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      ✨ {fileName}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 font-extrabold hover:bg-slate-50 shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 font-black" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Active File Path ribbon */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-1.5 text-[10px] text-slate-400 font-mono truncate shrink-0">
            📄 Path in spring boot workspace: <span className="font-bold text-slate-600">{handlerPath}</span>
          </div>

          {/* Code Render Body */}
          <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-[11px] sm:text-[12px] text-slate-100 leading-relaxed scrollbar-thin select-text">
            <pre className="whitespace-pre overflow-x-auto">
              <code>
                {fileContentToDisplay.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell text-right pr-4 text-slate-600 select-none text-[10px] w-8">{idx + 1}</span>
                    <span className="table-cell whitespace-pre">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

          {/* DUAL-PANE CO-ENG: GENIMI AI SPRING ARCHITECT DIALOG */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0">
            <form onSubmit={handleGenerateCustomComponent} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-700 uppercase font-mono tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 animate-pulse" />
                  Gemini Spring Architect AI Console
                </span>
                <span className="text-[10px] text-slate-400">Updates live code using server-side LLM models</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-4">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Target Generative File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RateLimitConfig.java"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-8 flex flex-col justify-end">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Architecture instructions / customization request</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Add validation annotations, create custom specs endpoint..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="px-4 bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shrink-0"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Crafting...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Verify & Inject</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {aiError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-800">
                  ⚠️ <strong>Compilation Error:</strong> {aiError}
                </div>
              )}

              {aiNotes && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-slate-600 flex items-start gap-1.5 leading-relaxed">
                  <span className="p-0.5 bg-emerald-100 rounded text-emerald-800 font-black text-[9px] uppercase font-mono mt-0.5">Architect Advisor Notes</span>
                  <div className="text-left font-sans">{aiNotes}</div>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: TOMCAT REAL-TIME JVM LOG MONITOR & TERMINAL (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-300 rounded-2xl overflow-hidden shadow-md flex flex-col h-[650px] border border-slate-900 text-left">
          
          {/* Terminal Title Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="w-px h-3 bg-slate-700" />
              <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                tomcat-jvm-nio-8080.log
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                STDOUT STATUS: CAPTURED
              </span>
              <button 
                onClick={clearLogsConsole}
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded font-bold cursor-pointer transition-all"
              >
                Clear Log
              </button>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="flex-1 bg-slate-950 p-4 font-mono text-[10px] sm:text-[11px] leading-relaxed overflow-y-auto space-y-1.5 scrollbar-thin select-text">
            {logsList.map((logLine, idx) => {
              // Colorize log levels for a perfect live high-fidelity terminal look
              let colorClass = "text-slate-300";
              
              if (logLine.includes("INFO")) {
                colorClass = "text-slate-300";
              } else if (logLine.includes("DEBUG") || logLine.includes("HHH00")) {
                colorClass = "text-slate-500";
              } else if (logLine.includes("WARN")) {
                colorClass = "text-amber-400";
              } else if (logLine.includes("ERROR") || logLine.includes("SYSTEM-ERROR")) {
                colorClass = "text-red-400 font-extrabold";
              } else if (logLine.startsWith("  .") || logLine.includes("Spring Boot")) {
                colorClass = "text-emerald-500 font-bold";
              } else if (logLine.includes("[SYSTEM-AI]")) {
                colorClass = "text-teal-400 font-bold";
              } else if (logLine.includes("GET") || logLine.includes("POST")) {
                colorClass = "text-cyan-400 font-bold";
              }

              return (
                <div key={idx} className={`${colorClass} whitespace-pre-wrap leading-normal`}>
                  {logLine}
                </div>
              );
            })}
            <div ref={terminalBottomRef} />
          </div>

          {/* Decoupling Helper Hints */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 select-none text-[10px] leading-loose shrink-0 text-slate-400 space-y-2">
            <h5 className="font-extrabold uppercase font-mono tracking-wider flex items-center gap-1 text-slate-300 text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
              How to Deploy & Run Locally?
            </h5>
            <ol className="list-decimal pl-4 font-mono space-y-1 text-left">
              <li>Open a terminal in your workspace and change directory: <code className="bg-slate-950 text-white p-0.5 rounded px-1.5">cd springboot-backend</code></li>
              <li>Launch Maven wrapper compilation: <code className="bg-slate-950 text-white p-0.5 rounded px-1.5">mvn spring-boot:run</code></li>
              <li>Spring bootstraps on port <span className="text-white font-bold">8080</span>, automatically loading the SQL database and REST route registries.</li>
              <li>Connect your React REST proxy to <code className="bg-slate-950 text-white p-0.5 rounded px-1.5">http://localhost:8080/api</code> for robust database storage!</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
}
